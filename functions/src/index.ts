import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const db = admin.firestore();

export const notifyNewMessage = functions.firestore
  .document('chats/{chatId}/messages/{messageId}') // <--- ESCUTA O CAMINHO CORRETO
  .onCreate(async (snap, context) => {
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
    const fcmToken = userData?.pushToken;

    if (!fcmToken) {
      console.log(`Usuário ${recipientId} sem token de notificação (ou campo 'pushToken' ausente).`);
      return null;
    }
    const messageBody = (newMessage.text && String(newMessage.text).trim() !== '')
      ? String(newMessage.text)
      : "Você recebeu uma nova mensagem";

    const payload: admin.messaging.MessagingPayload = {
      notification: {
        // 💥 CORRIGIDO: Garantia de string no body e title
        title: `Nova Mensagem!`,
        body: messageBody.length > 50 ? messageBody.substring(0, 47) + "..." : messageBody,
      },
      data: {
        // É crucial enviar o chatId aqui para o frontend
        chatId: chatId,
      }
    };

    // sendToDevice funciona para Expo Push Tokens e FCM tokens.
    await admin.messaging().sendToDevice(fcmToken, payload);
    console.log(`Notificação enviada para o chat ${chatId}.`);
    return null;
  });