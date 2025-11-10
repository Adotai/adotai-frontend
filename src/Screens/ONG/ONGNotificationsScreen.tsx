import { View, Text, StatusBar, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { Theme } from '../../../constants/Themes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig'; // Verifique o caminho
import { useNavigation } from '@react-navigation/native'; // Para navegação (opcional)
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types'; // Verifique o caminho
import { Ionicons } from '@expo/vector-icons';
import { fetchAnimalById } from '../../actions/userActions'; // ajuste o caminho se necessário
import { getOrCreateChatRoom } from '../../actions/actions'; // ajuste o caminho

// Interface para definir a estrutura de uma notificação
interface NotificationItem {
  id: string; // ID do documento no Firestore
  title: string;
  body: string;
  timestamp: any; // Firestore Timestamp
  read: boolean;
  // Adicione outros campos que você salva, como requestId, animalId, userId
  requestId?: string;
  animalId?: string | number;
  userId?: string | number
}


export default function ONGNotificationsScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>(); // Para navegação
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ongId, setOngId] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    const getOngId = async () => {
      const userString = await AsyncStorage.getItem('user'); 
      if (userString) {
        const userData = JSON.parse(userString);
        const id = userData?.id || userData; 
        if (id) {
            // ▼▼▼ LOG 1: VERIFICAR O ID OBTIDO ▼▼▼
           // console.log("ONGNotificationsScreen - ID da ONG obtido:", String(id)); 
            setOngId(String(id)); 
        } else {
             console.error("ONGNotificationsScreen - ID da ONG não encontrado no JSON do AsyncStorage.");
             setLoading(false);
        }
      } else {
         console.error("ONGNotificationsScreen - 'user' não encontrado no AsyncStorage.");
         setLoading(false);
      }
    };
    getOngId();
  }, []);

  useEffect(() => {
    // ▼▼▼ LOG 2: VERIFICAR SE O LISTENER ESTÁ SENDO CONFIGURADO ▼▼▼
    if (!ongId) {
        // console.log("ONGNotificationsScreen - Aguardando ongId...");
        return; 
    }
    //console.log(`ONGNotificationsScreen - Configurando listener para: users/${ongId}/notifications`); 

    setLoading(true);
    const notificationsRef = collection(db, 'users', ongId, 'notifications');
    const q = query(notificationsRef, orderBy('timestamp', 'desc')); 

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // ▼▼▼ LOG 3: VERIFICAR SE O LISTENER RECEBE DADOS ▼▼▼
      //console.log("ONGNotificationsScreen - Listener do Firestore acionado! Qtd docs:", querySnapshot.size); 
      const fetchedNotifications: NotificationItem[] = [];
      querySnapshot.forEach((doc) => {
        // ▼▼▼ LOG 4: VERIFICAR DADOS DE CADA DOC ▼▼▼
        //console.log("ONGNotificationsScreen - Notificação do Firestore:", doc.id, doc.data()); 
        fetchedNotifications.push({ id: doc.id, ...doc.data() } as NotificationItem);
      });
      // ▼▼▼ LOG 5: VERIFICAR O ARRAY FINAL ANTES DE SETAR O ESTADO ▼▼▼
      //console.log("ONGNotificationsScreen - Notificações processadas:", fetchedNotifications); 
      setNotifications(fetchedNotifications);
      setLoading(false);
    }, (error) => { 
      console.error("ONGNotificationsScreen - Erro no listener: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [ongId]);
  // 3. Função para marcar notificação como lida (opcional)
  const markAsRead = async (notificationId: string) => {
     if (!ongId) return;
     try {
         const notifDocRef = doc(db, 'users', ongId, 'notifications', notificationId);
         await updateDoc(notifDocRef, { read: true });
        //  console.log(`Notificação ${notificationId} marcada como lida.`);
     } catch (error) {
        //  console.error("Erro ao marcar notificação como lida:", error);
     }
  };

  const handleNotificationPress = (item: NotificationItem) => {
    if (!item.read) {
        markAsRead(item.id);
    }
  };

  const deleteNotification = async (notificationId: string) => {
  if (!ongId) return;
  try {
    const notifDocRef = doc(db, 'users', ongId, 'notifications', notificationId);
    await deleteDoc(notifDocRef);
    // console.log(`Notificação ${notificationId} excluída.`);
  } catch (error) {
    // console.error("Erro ao excluir notificação:", error);
  }
};

  // Funções para as ações do menu
  const handleMenu = (item: NotificationItem) => {
    setSelectedNotification(item);
    setMenuVisible(true);
  };

  const handleDelete = async () => {
    if (selectedNotification) {
      await deleteNotification(selectedNotification.id);
      setMenuVisible(false);
    }
  };

  const handleChat = async () => {
  if (selectedNotification?.userId && ongId) {
    const chatId = await getOrCreateChatRoom(Number(selectedNotification.userId), Number(ongId));
    if (chatId) {
      navigation.navigate('Chat', {
        chatId: String(chatId),
        loggedInUserId: Number(ongId)
      });
      setMenuVisible(false);
    } else {
      Alert.alert('Erro', 'Não foi possível encontrar ou criar o chat.');
    }
  }
};

  const handleViewAnimal = async () => {
    if (selectedNotification?.animalId) {
      const animal = await fetchAnimalById(Number(selectedNotification.animalId));
      if (animal) {
        navigation.navigate('ONGAnimalDetails', { animal });
        setMenuVisible(false);
      } else {
        Alert.alert('Erro', 'Animal não encontrado.');
      }
    }
  };

  // 5. Renderizar item da lista
  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1, padding: 12 }}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationBody}>{item.body}</Text>
        {item.timestamp && (
          <Text style={[styles.notificationTime]}>
            {new Date(item.timestamp?.toDate()).toLocaleString('pt-BR')}
          </Text>
        )}
      </View>
      <View style={{ alignItems: 'center', justifyContent: 'center', padding: 12 }}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => handleMenu(item)}
        >
          <Ionicons name="ellipsis-vertical" size={22} color={Theme.PRIMARY} />
        </TouchableOpacity>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar backgroundColor={Theme.TERTIARY} barStyle="light-content" />
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Theme.BACK }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Notificações
          </Text>
        </View>
        {/* Corpo da Tela */}
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color={Theme.PRIMARY} style={{ marginTop: 50 }} />
          ) : notifications.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma notificação encontrada.</Text>
          ) : (
            <FlatList
              data={notifications}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
        {/* Modal de opções */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
            <View style={styles.menuModal}>
              <TouchableOpacity style={styles.menuOption} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={18} color="#f44336" style={{ marginRight: 8 }} />
                <Text style={{ color: '#f44336', fontSize: 16 }}>Excluir notificação</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuOption} onPress={handleChat} disabled={!selectedNotification?.userId}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={Theme.PRIMARY} style={{ marginRight: 8 }} />
                <Text style={{ color: Theme.PRIMARY, fontSize: 16, opacity: selectedNotification?.userId ? 1 : 0.5 }}>
                  Conversar com o usuário
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuOption} onPress={handleViewAnimal} disabled={!selectedNotification?.animalId}>
                <Ionicons name="paw-outline" size={18} color={Theme.PRIMARY} style={{ marginRight: 8 }} />
                <Text style={{ color: Theme.PRIMARY, fontSize: 16, opacity: selectedNotification?.animalId ? 1 : 0.5 }}>
                  Ver animal
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </>
  );
}

// Estilos
const styles = StyleSheet.create({
    header: {
        width: '100%',
        padding: 16,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        backgroundColor: Theme.TERTIARY, // Cor do header
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: Theme.BACK, // Cor do texto do header
    },
    content: {
        flex: 1,
        paddingHorizontal: 10, // Espaçamento lateral
        paddingTop: 10,
    },
    notificationItem: {
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2, // Sombra no Android
        shadowColor: '#000', // Sombra no iOS
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        flexDirection: 'row'
    },
    unreadItem: {
        // Estilo extra para itens não lidos, se desejar (ex: borda)
        // borderColor: Theme.PRIMARY,
        // borderWidth: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 4,
    },
    notificationBody: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#555',
    },
    notificationTime: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#999',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#888',
        fontFamily: 'Poppins-Regular',
    },
    unreadDot: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Theme.PRIMARY,
    },
    deleteButton: {       
        width: 32,
        height: 32,
        alignItems: 'center',
        borderRadius: 8,
        justifyContent: 'center',
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 18,
    },
    menuButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        borderRadius: 8,
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuModal: {
        backgroundColor: 'white',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        minWidth: 220,
        elevation: 5,
    },
    menuOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
});