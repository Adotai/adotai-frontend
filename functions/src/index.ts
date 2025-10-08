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