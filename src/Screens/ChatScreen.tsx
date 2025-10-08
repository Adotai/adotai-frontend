import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';
import { db } from '../services/firebaseConfig'; 
import { Theme } from '../../constants/Themes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from "firebase/firestore";


interface Message {
  id: string;
  text: string;
  userId: string;
  createdAt: any;
  senderRole: 'user' | 'ong'; 
}

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  
  interface ChatScreenRouteParams {
    chatId: string;
    loggedInUserId: string;
  }

  const route = useRoute();
  const { chatId, loggedInUserId } = (route.params as ChatScreenRouteParams) || {};

  useEffect(() => {
    AsyncStorage.getItem('userRole').then(setUserRole);
  }, []);

  // Se não houver chatId, mostra uma tela informativa
   if (!chatId) {
        return ( // Retorna JSX e sai do componente
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
                <Text style={{ fontSize: 18, color: '#555', textAlign: 'center' }}>
                    Nenhuma conversa iniciada ainda.
                </Text>
                <Text style={{ fontSize: 14, color: '#888', marginTop: 8, textAlign: 'center' }}>
                    Inicie um chat para visualizar as mensagens.
                </Text>
            </View>
        );
    }

  // Lógica de leitura em tempo real com onSnapshot
  useEffect(() => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]); // A dependência garante que o listener seja refeito se o chat mudar

  // Lógica de envio da mensagem
  const sendMessage = async () => {
  if (inputText.trim() === '') return;

  const chatRef = doc(db, 'chats', chatId);
  const chatSnap = await getDoc(chatRef);

  // 🔥 Se o chat ainda não existe, cria o documento pai
  if (!chatSnap.exists()) {
    // Aqui você pode pegar o papel do usuário e decidir quem é quem
    const storedRole = await AsyncStorage.getItem('userRole');
    const storedOngId = await AsyncStorage.getItem('ongId');

    const userId = loggedInUserId;
    const ongId = storedOngId || "1"; // ou de onde vier o ID real da ONG

    await setDoc(chatRef, {
      userId,
      ongId
    });
  }

  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    text: inputText,
    userId: loggedInUserId,
    senderRole: userRole,
    createdAt: serverTimestamp(),
  });

  setInputText('');
};

  // Renderização de cada item da lista
  const renderItem = ({ item }: { item: Message }) => {
    const isMyMessage = item.userId === loggedInUserId && item.senderRole === userRole;
    const isOngMessage = item.senderRole === 'ong';

    return (
      <View>

      <View
        style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessage : styles.otherMessage,
          isOngMessage
            ? { backgroundColor: Theme.INPUT }
            : { backgroundColor: Theme.PRIMARY }
        ]}
      >

        <Text
          style={[
            styles.messageText          ]}
        >
          {item.text}
        </Text>
      </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        inverted
        contentContainerStyle={styles.messagesList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Digite uma mensagem..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    maxWidth: '80%',
  },
  myMessage: {
    backgroundColor: Theme.PASTEL,
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: Theme.BACK,
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: '#000',
  },
  otherMessageText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: Theme.BACK,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 25,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: Theme.PRIMARY,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatScreen;