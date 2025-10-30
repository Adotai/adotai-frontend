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
  .document('adoptionRequests/{requestId}')
  .onCreate(async (snap, context) => {
    
    console.log("--- NOVA SOLICITAÇÃO (LÓGICA SIMPLIFICADA) ---");
    const requestData = snap.data(); // Pega os dados salvos pelo App
    const requestId = context.params.requestId;

    // Valida dados essenciais (incluindo os nomes que o app salvou)
    if (!requestData || !requestData.userId || !requestData.ongId || !requestData.animalId || !requestData.userName || !requestData.animalName) {
      console.error(`Dados incompletos na solicitação ${requestId} (sem nomes?):`, requestData);
      return null; 
    }

    // Pega os IDs E OS NOMES diretamente do documento
    const requesterId = requestData.userId;
    const ongId = requestData.ongId;
    const animalId = requestData.animalId;
    const userName = requestData.userName; 
    const animalName = requestData.animalName; 

    console.log(`Dados lidos: Usuário ${userName} (${requesterId}) solicitou ${animalName} (${animalId}) para ONG ${ongId}`);

    // --- Busca Token da ONG (Firestore - continua igual) ---
    // *** AJUSTE 'users' se o token da ONG estiver em 'ongs' ***
    const ongDocRef = db.collection('users').doc(String(ongId));
    let fcmToken: string | null = null;
    try {
        const ongDoc = await ongDocRef.get();
        if (!ongDoc.exists) { console.log(`Doc ONG ${ongId} não encontrado.`); return null; }
        fcmToken = ongDoc.data()?.expoPushToken; // *** AJUSTE 'expoPushToken' se necessário ***
        if (!fcmToken) { console.log(`ONG ${ongId} sem token.`); return null; }
    } catch (dbError) { console.error(`Erro ao buscar ONG ${ongId}:`, dbError); return null;}
    // --- Fim Busca Token ---

    // --- Montagem da Mensagem (Usa nomes do requestData) ---
    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title: "Nova Solicitação de Adoção!",
        body: `${userName} tem interesse em adotar ${animalName}.`, // <-- USA OS NOMES CORRETOS!
      },
      data: { 
        requestId: requestId,
        animalId: String(animalId),
        userId: String(requesterId),
        type: 'adoption_request'
      }
    };
    // --- Fim Montagem ---

    // --- Envio e Salvamento no Histórico ---
    try {
      await admin.messaging().send(message);
      console.log(`Notificação PUSH enviada para ONG ${ongId}.`);
      
      const notificationData = {
          title: message.notification?.title || "Nova Solicitação de Adoção!",
          body: message.notification?.body || `${userName} tem interesse em adotar ${animalName}.`, // Usa nomes corretos
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          read: false,
          requestId: requestId,
          animalId: String(animalId),
          userId: String(requesterId),
          type: 'adoption_request'
      };
      
      // *** AJUSTE 'users' se o histórico da ONG for em 'ongs' ***
      await db.collection('users').doc(String(ongId)).collection('notifications').add(notificationData);
      console.log(`Notificação salva no histórico da ONG ${ongId} com os nomes corretOS.`);

    } catch (error: any) { 
        console.error(`ERRO AO ENVIAR/SALVAR NOTIFICAÇÃO para ONG ${ongId}:`, error);
         if (error.code === 'messaging/registration-token-not-registered') {
            console.warn("Token inválido detectado, removendo...");
            await ongDocRef.update({ expoPushToken: admin.firestore.FieldValue.delete() });
         }
    }
    // --- Fim Envio/Salvamento ---

    return null;
  });
