import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
//   projectId: "tcc-adotai", 
// });
admin.initializeApp();


const db = admin.firestore();

export const notifyNewMessage = functions.firestore
  .document('chats/{chatId}/messages/{messageId}') // <--- ESCUTA O CAMINHO CORRETO
  .onCreate(async (snap, context) => {

    console.log("--- EXECUTANDO A VERSÃO FINAL DA FUNÇÃO ---");

    const newMessage = snap.data();
    const chatId = context.params.chatId;

    if (!newMessage || !newMessage.userId) return null; // userId é o remetente

    // 1. Busca o documento do CHAT para identificar o DESTINATÁRIO
    const chatDoc = await db.collection('chats').doc(chatId).get();
    const chatData = chatDoc.data();

    if (!chatData || !chatData.userId || !chatData.ongId) {
      console.log(`Chat ${chatId} incompleto ou não existe.`);
      return null;
    }

    // Identifica o ID do destinatário (o outro participante do chat)
    const senderId = String(newMessage.userId);
    const recipientId = (senderId === String(chatData.userId)) ? chatData.ongId : chatData.userId;

    // 2. Busca o token do destinatário na coleção 'users'
    // Aqui assumimos que o ID do seu banco de dados (armazenado em userId/ongId) 
    // é a chave do documento na coleção 'users'.
    const userDoc = await db.collection('users').doc(String(recipientId)).get();
    const userData = userDoc.data();

    // O campo é 'expoPushToken' ou 'fcmToken' - vamos usar 'expoPushToken' para ser explícito
    const fcmToken = userData?.expoPushToken;

    if (!fcmToken) {
      console.log(`Usuário ${recipientId} sem token de notificação (ou campo 'pushToken' ausente).`);
      return null;
    }
    const messageBody = (newMessage.text && String(newMessage.text).trim() !== '')
      ? String(newMessage.text)
      : "Você recebeu uma nova mensagem";

    const message: admin.messaging.Message = {
      token: fcmToken, // O token vai aqui dentro
      notification: {
        title: `Nova Mensagem!`,
        body: messageBody.length > 50 ? messageBody.substring(0, 47) + "..." : messageBody,
      },
      data: {
        chatId: chatId,
      }
    };

    // Use o método .send() que é mais moderno
    await admin.messaging().send(message);
    console.log(`Notificação enviada para o chat ${chatId}.`);
    return null;
  });


export const notifyAdoptionRequest = functions.firestore
  .document('adoptionRequests/{requestId}') // <-- Escuta a coleção correta
  .onCreate(async (snap, context) => {
    
    console.log("--- NOVA SOLICITAÇÃO DE ADOÇÃO DETECTADA ---");

    const requestData = snap.data();

    // Verificações básicas (ajuste os nomes dos campos se necessário)
    if (!requestData || !requestData.userId || !requestData.ongId || !requestData.animalId) {
      console.error("Dados da solicitação incompletos:", requestData);
      return null;
    }

    const requesterId = requestData.userId; // ID do usuário que pediu
    const ongId = requestData.ongId;       // ID da ONG que deve ser notificada
    const animalId = requestData.animalId; // ID do animal (para a mensagem)

    console.log(`Usuário ${requesterId} solicitou adoção do animal ${animalId} para a ONG ${ongId}`);

    // --- Busca de Nomes ---
    let userName = `Um usuário`; // Valor padrão
    let animalName = "um animal"; // Valor padrão

    try {
        // Busca o nome do usuário
        const userDoc = await db.collection('users').doc(String(requesterId)).get();
        if (userDoc.exists && userDoc.data()?.name) {
            userName = userDoc.data()?.name;
            console.log("Nome do usuário encontrado:", userName);
        } else {
            console.log("Nome do usuário não encontrado ou campo 'name' ausente.");
        }

        // Busca o nome do animal (Ajuste 'animals' e 'name' se necessário)
        const animalDoc = await db.collection('animals').doc(String(animalId)).get();
        if (animalDoc.exists && animalDoc.data()?.name) {
            animalName = animalDoc.data()?.name;
            console.log("Nome do animal encontrado:", animalName);
        } else {
            console.log("Nome do animal não encontrado ou campo 'name' ausente.");
        }
    } catch (e) { 
        console.error("Erro ao buscar nomes:", e); 
        // Continua com os nomes padrão se a busca falhar
    }
    // --- Fim da Busca de Nomes ---

    // Busca o token da ONG (Ajuste 'users' se o token estiver em 'ongs')
    const ongDoc = await db.collection('users').doc(String(ongId)).get(); 
    const ongData = ongDoc.data();
    const fcmToken = ongData?.expoPushToken;

    if (!fcmToken) {
      console.log(`ONG ${ongId} sem token de notificação.`);
      return null;
    }

    // Monta a mensagem para a ONG usando os nomes buscados
    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title: "Nova Solicitação de Adoção!",
        body: `${userName} tem interesse em adotar ${animalName}.`, // <-- Nomes atualizados aqui
      },
      data: {
        requestId: context.params.requestId, 
        animalId: String(animalId),
        userId: String(requesterId)
      }
    };

    try {
      // 1. Envia a notificação PUSH
      await admin.messaging().send(message);
      console.log(`Notificação de adoção enviada com sucesso para a ONG ${ongId}.`);

      // 2. Salva a notificação no histórico da ONG
      const notificationData = {
        title: message.notification?.title || "Nova Solicitação de Adoção!",
        body: message.notification?.body || `${userName} tem interesse em adotar ${animalName}.`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
        // Salva os IDs para possível navegação
        requestId: context.params.requestId,
        animalId: String(animalId),
        userId: String(requesterId)
      };

      // (Verifique se a coleção é 'users' ou 'ongs' para a ONG)
      await db.collection('users').doc(String(ongId)) 
              .collection('notifications')
              .add(notificationData);
      console.log(`Notificação salva no histórico da ONG ${ongId}.`);

    } catch (error: any) { // Captura o erro para ver detalhes
      console.error(`ERRO AO ENVIAR/SALVAR NOTIFICAÇÃO DE ADOÇÃO para ONG ${ongId} (token ${fcmToken}):`, error);
      if (error.code === 'messaging/mismatched-credential') {
        console.error("CAUSA PROVÁVEL: O token pertence a um projeto Firebase diferente.");
      } else if (error.code === 'messaging/registration-token-not-registered') {
        console.error("CAUSA PROVÁVEL: O token não é mais válido (app desinstalado?). Considere remover este token do Firestore.");
        // Opcional: Remover o token inválido do Firestore aqui
        // await db.collection('users').doc(String(ongId)).update({ expoPushToken: admin.firestore.FieldValue.delete() });
      }
    }

    return null;
  });

