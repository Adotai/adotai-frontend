import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../services/firebaseConfig';
import { Theme } from '../../constants/Themes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { fetchOngs } from '../actions/userActions';
import { fetchUsers } from '../actions/ongActions';
import { Ionicons } from '@expo/vector-icons';


interface Message {
  id: string;
  text: string;
  userId: string;
  createdAt: any;
  senderRole: 'user' | 'ong';
}

type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);

  const [participantName, setParticipantName] = useState('Carregando...');
  const [participantObject, setParticipantObject] = useState<any>(null);
  const [otherRole, setOtherRole] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const route = useRoute();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const { chatId, loggedInUserId } = (route.params as any) || {};

  useEffect(() => {
    AsyncStorage.getItem('userRole').then(role => {
      setUserRole(role);
    });
  }, []);

  useEffect(() => {
  
    if (!chatId || !loggedInUserId || !userRole) {
      //console.warn('Aguardando dados', { chatId: !!chatId, loggedInUserId: !!loggedInUserId, userRole: !!userRole }); 
      return; 
    }

    const fetchParticipantInfo = async () => {
      try {
        const chatDoc = await getDoc(doc(db, 'chats', chatId));
        if (!chatDoc.exists()) {
          console.error("Documento do chat NÃO encontrado");
          setParticipantName("Chat");
          return;
        }
        const chatData = chatDoc.data();
        const otherId = String(loggedInUserId) === String(chatData.userId) ? String(chatData.ongId) : String(chatData.userId);
        let role: 'user' | 'ong' | null = null;
        if (userRole === 'normal' || userRole === 'admin') {
          role = 'ong';
        } else if (userRole === 'ong') {
          role = 'user';
        }

        setOtherRole(role);

        if (role === 'ong') {
          const allOngs = await fetchOngs();
          const ongObject = allOngs.find(o => String(o.id) === otherId);
          if (ongObject) {
            setParticipantName(ongObject.name);
            setParticipantObject(ongObject);
          } else { console.error(`ONG com ID ${otherId} não encontrada na lista 'fetchOngs'`); }
        } else if (role === 'user') {
          const allUsers = await fetchUsers();
          const userObject = allUsers.find(u => String(u.id) === otherId);
          if (userObject) {
            setParticipantName(userObject.name);
            setParticipantObject(userObject);
          } else { console.error(`Usuário com ID ${otherId} não encontrado na lista 'fetchUsers'`); }
        } else {
          console.error(`Papel de usuário desconhecido ou nulo: ${userRole}`);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do participante:", error);
        setParticipantName("Chat");
      }
    };

    fetchParticipantInfo();
  }, [chatId, loggedInUserId, userRole]); 

  const navigateToProfile = () => {
    if (!participantObject || !otherRole) {
      Alert.alert("Aguarde", "Carregando dados do participante...");
      return;
    }
    if (otherRole === 'ong') {
      navigation.navigate('UserONGDetail', { ong: participantObject });
    } else {
      navigation.navigate('ONGUserProfile', { user: participantObject });
    }
  };

 useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity onPress={navigateToProfile}>
          <Text style={styles.headerTitleText}>{participantName}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, participantName, participantObject, otherRole]);

  if (!chatId) {
    return (
      <View style={styles.noChatContainer}>
        <Text style={styles.noChatText}>Nenhuma conversa iniciada ainda.</Text>
        <Text style={styles.noChatSubText}>Inicie um chat para visualizar as mensagens.</Text>
      </View>
    );
  }

  useEffect(() => {
    if (!chatId) return; 

    setLoadingMessages(true); 
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
      setLoadingMessages(false); 
    }, (error) => {
      console.error("Erro ao buscar mensagens", error); 
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    if (!loggedInUserId || !userRole) {
      console.error("Não é possível enviar mensagem, usuário ou role não definidos.");
      return;
    }

    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      console.warn("Criando doc de chat que não existia ");
      console.error(`Chat doc ${chatId} não existe! A criação de chat deve acontecer ANTES de navegar para esta tela.`);
      return;
    }

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: inputText,
      userId: loggedInUserId,
      senderRole: userRole,
      createdAt: serverTimestamp(),
    });

    setInputText('');
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMyMessage = String(item.userId) === String(loggedInUserId) && item.senderRole === userRole;
    const isOngMessage = item.senderRole === 'ong';

    return (
      <View>
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessage : styles.otherMessage,
            isMyMessage ? styles.myMessage : styles.otherMessage
          ]}
        >
          <Text style={isMyMessage ? styles.myMessageText : styles.otherMessageText}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} 
      >
        {loadingMessages ? (
          <ActivityIndicator style={{ flex: 1 }} size="large" color={Theme.PRIMARY} />
        ) : (
          <FlatList
            data={messages}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            inverted
            contentContainerStyle={styles.messagesList}
          />
        )}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  headerTitleText: {
    fontSize: 17, 
    fontFamily: 'Poppins-SemiBold', 
  },
  noChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Theme.BACK,
  },
  noChatText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  noChatSubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  messagesList: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingVertical: 10,
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginVertical: 4,
    marginHorizontal: 10,
    maxWidth: '80%',
  },
  myMessage: {
    backgroundColor: Theme.PRIMARY,
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: Theme.BACK,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#eee',
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
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
    borderColor: '#ddd',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginRight: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    minHeight: 40, 
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