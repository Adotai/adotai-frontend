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
        userId: Number(userId),
        ongId: Number(ongId)
      }, { merge: true });
    }''

    return chatRoom;
  } catch (error) {
    console.error('Erro ao criar chat:', error);
    throw error;
  }
};

export const fetchAnimalById = async (animalId: number): Promise<any | null> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token || !USER_ROUTE) {
        console.error("Token ou rota não definidos para buscar animal.");
        return null;
    }

    // Usa o endpoint correto que já consertamos: /animal/id/{id}
    const response = await axios.get(`${USER_ROUTE}/animal/id/${animalId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Verifica a estrutura da resposta (geralmente está em response.data.data)
    if (response.data && response.data.data) {
      return response.data.data;
    } else if (response.data) {
       // Fallback caso a API mude e retorne direto no raiz
       return response.data;
    } else {
      console.warn(`Dados do animal ${animalId} não encontrados na resposta da API.`);
      return null;
    }
  } catch (err: any) {
    console.error(`Erro ao buscar animal completo ${animalId}:`, err.response?.data || err.message);
    return null;
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

export const getOrCreateChatRoom = async (userId: number, ongId: number) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    // Buscar todos os chats da ONG
    const response = await axios.get(
      `${USER_ROUTE}/chat/rooms/account/${ongId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const chats = response.data as any[];
    // Procura chat entre userId e ongId
    let chatRoom = chats.find(
      c => (c.userId === userId && c.ongId === ongId) || (c.userId === ongId && c.ongId === userId)
    );
    if (!chatRoom) {
      // Se não existe, cria
      const createResponse = await axios.post(
        `${USER_ROUTE}/chat/room`,
        { id: 0, userId, ongId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      chatRoom = createResponse.data;
    }
    // Garante que o Firestore tem o chat com o ID correto
    await setDoc(doc(db, "chats", String(chatRoom.id)), {
      userId: Number(userId),
      ongId: Number(ongId)
    }, { merge: true });
    return chatRoom.id;
  } catch (error) {
    console.error('Erro ao buscar/criar chat:', error);
    throw error;
  }
};