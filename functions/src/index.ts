import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

admin.initializeApp();


const db = admin.firestore();

export const notifyNewMessage = functions.firestore
  .document('chats/{chatId}/messages/{messageId}') 
  .onCreate(async (snap, context) => {

    console.log("--- EXECUTANDO A VERSÃO FINAL DA FUNÇÃO ---");

    const newMessage = snap.data();
    const chatId = context.params.chatId;

    if (!newMessage || !newMessage.userId) return null; 

    const chatDoc = await db.collection('chats').doc(chatId).get();
    const chatData = chatDoc.data();

    if (!chatData || !chatData.userId || !chatData.ongId) {
      console.log(`Chat ${chatId} incompleto ou não existe.`);
      return null;
    }

    const senderId = String(newMessage.userId);
    const recipientId = (senderId === String(chatData.userId)) ? chatData.ongId : chatData.userId;

    const userDoc = await db.collection('users').doc(String(recipientId)).get();
    const userData = userDoc.data();

    const fcmToken = userData?.expoPushToken;

    if (!fcmToken) {
      console.log(`Usuário ${recipientId} sem token de notificação (ou campo 'pushToken' ausente).`);
      return null;
    }
    const messageBody = (newMessage.text && String(newMessage.text).trim() !== '')
      ? String(newMessage.text)
      : "Você recebeu uma nova mensagem";

    const message: admin.messaging.Message = {
      token: fcmToken, 
      notification: {
        title: `Nova Mensagem!`,
        body: messageBody.length > 50 ? messageBody.substring(0, 47) + "..." : messageBody,
      },
      data: {
        chatId: chatId,
      }
    };

    await admin.messaging().send(message);
    console.log(`Notificação enviada para o chat ${chatId}.`);
    return null;
  });


export const notifyAdoptionRequest = functions.firestore
  .document('adoptionRequests/{requestId}')
  .onCreate(async (snap, context) => {
    
    console.log("--- NOVA SOLICITAÇÃO (LÓGICA SIMPLIFICADA) ---");
    const requestData = snap.data(); 
    const requestId = context.params.requestId;

    if (!requestData || !requestData.userId || !requestData.ongId || !requestData.animalId || !requestData.userName || !requestData.animalName) {
      console.error(`Dados incompletos na solicitação ${requestId} (sem nomes?):`, requestData);
      return null; 
    }

    const requesterId = requestData.userId;
    const ongId = requestData.ongId;
    const animalId = requestData.animalId;
    const userName = requestData.userName; 
    const animalName = requestData.animalName; 

    console.log(`Dados lidos: Usuário ${userName} (${requesterId}) solicitou ${animalName} (${animalId}) para ONG ${ongId}`);

    const ongDocRef = db.collection('users').doc(String(ongId));
    let fcmToken: string | null = null;
    try {
        const ongDoc = await ongDocRef.get();
        if (!ongDoc.exists) { console.log(`Doc ONG ${ongId} não encontrado.`); return null; }
        fcmToken = ongDoc.data()?.expoPushToken; 
        if (!fcmToken) { console.log(`ONG ${ongId} sem token.`); return null; }
    } catch (dbError) { console.error(`Erro ao buscar ONG ${ongId}:`, dbError); return null;}

    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title: "Nova Solicitação de Adoção!",
        body: `${userName} tem interesse em adotar ${animalName}.`, 
      },
      data: { 
        requestId: requestId,
        animalId: String(animalId),
        userId: String(requesterId),
        type: 'adoption_request'
      }
    };
    
    try {
      await admin.messaging().send(message);
      console.log(`Notificação PUSH enviada para ONG ${ongId}.`);
      
      const notificationData = {
          title: message.notification?.title || "Nova Solicitação de Adoção!",
          body: message.notification?.body || `${userName} tem interesse em adotar ${animalName}.`, 
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          read: false,
          requestId: requestId,
          animalId: String(animalId),
          userId: String(requesterId),
          type: 'adoption_request'
      };
      
      await db.collection('users').doc(String(ongId)).collection('notifications').add(notificationData);
      console.log(`Notificação salva no histórico da ONG ${ongId} com os nomes corretOS.`);

    } catch (error: any) { 
        console.error(`ERRO AO ENVIAR/SALVAR NOTIFICAÇÃO para ONG ${ongId}:`, error);
         if (error.code === 'messaging/registration-token-not-registered') {
            console.warn("Token inválido detectado, removendo...");
            await ongDocRef.update({ expoPushToken: admin.firestore.FieldValue.delete() });
         }
    }

    return null;
  });



  export const notifyAnimalSubmission = functions.firestore
  .document('animalSubmissions/{submissionId}')
  .onCreate(async (snap, context) => {

    console.log("--- NOVA DOAÇÃO DETECTADA ---");
    const data = snap.data();

    if (!data || !data.ongId || !data.animalName) {
        console.error("Dados da doação incompletos.");
        return null;
    }

    const ongId = data.ongId;
    const userName = data.userName || 'Um usuário';
    const animalName = data.animalName || 'um animal';

    try {
        const ongDoc = await db.collection('users').doc(String(ongId)).get();
        const fcmToken = ongDoc.data()?.expoPushToken;

        if (!fcmToken) {
            console.log(`ONG ${ongId} não tem token de notificação.`);
            return null;
        }

        const message = {
            token: fcmToken,
            notification: {
                title: "Chegou um novo bichinho para análise!",
                body: `${userName} enviou o animal "${animalName}" para análise.`,
            },
            data: {
                type: 'donation_submission',
                submissionId: context.params.submissionId
            }
        };

        await admin.messaging().send(message);
        console.log(`Notificação de doação enviada para ONG ${ongId}`);

        await db.collection('users').doc(String(ongId)).collection('notifications').add({
            title: message.notification.title,
            body: message.notification.body,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            read: false,
            type: 'donation',
            animalName: animalName,
            userId: data.userId
        });

    } catch (error) {
        console.error("Erro ao enviar notificação de doação:", error);
    }

    return null;
});
