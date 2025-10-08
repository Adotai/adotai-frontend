import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { doc, setDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

const USER_ROUTE = Constants.expoConfig?.extra?.USER_ROUTE;

if (!USER_ROUTE) {
  console.error('USER_ROUTE is not defined in app.json');
}

// Criar novo chat entre usuário e ONG
export const createChatRoom = async (userId: number, ongId: number) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const response = await axios.post(
      `${USER_ROUTE}/chat/room`,
      { id: 0, userId, ongId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const chatRoom = response.data; 

    if (chatRoom?.id) {
      await setDoc(doc(db, "chats", String(chatRoom.id)), {
        userId: String(userId),
        ongId: String(ongId)
      }, { merge: true });
    }

    return chatRoom;
  } catch (error) {
    console.error('Erro ao criar chat:', error);
    throw error;
  }
};

// Buscar todos os chats do usuário/ong
export const fetchChatsByAccount = async (accountId: number) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const response = await axios.get(
      `${USER_ROUTE}/chat/rooms/account/${accountId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data; // Array de ChatRoomDTO
  } catch (error) {
    console.error('Erro ao buscar chats:', error);
    throw error;
  }
};