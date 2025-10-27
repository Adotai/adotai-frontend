import { View, Text, StatusBar, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { Theme } from '../../../constants/Themes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig'; // Verifique o caminho
import { useNavigation } from '@react-navigation/native'; // Para navegação (opcional)
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types'; // Verifique o caminho

// Interface para definir a estrutura de uma notificação
interface NotificationItem {
  id: string; // ID do documento no Firestore
  title: string;
  body: string;
  timestamp: any; // Firestore Timestamp
  read: boolean;
  // Adicione outros campos que você salva, como requestId, animalId, userId
  requestId?: string;
  animalId?: string;
  userId?: string;
}

export default function ONGNotificationsScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>(); // Para navegação
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ongId, setOngId] = useState<string | null>(null);

  useEffect(() => {
    const getOngId = async () => {
      const userString = await AsyncStorage.getItem('user'); 
      if (userString) {
        const userData = JSON.parse(userString);
        const id = userData?.id || userData; 
        if (id) {
            // ▼▼▼ LOG 1: VERIFICAR O ID OBTIDO ▼▼▼
            console.log("ONGNotificationsScreen - ID da ONG obtido:", String(id)); 
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
        console.log("ONGNotificationsScreen - Aguardando ongId...");
        return; 
    }
    console.log(`ONGNotificationsScreen - Configurando listener para: users/${ongId}/notifications`); 

    setLoading(true);
    const notificationsRef = collection(db, 'users', ongId, 'notifications');
    const q = query(notificationsRef, orderBy('timestamp', 'desc')); 

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // ▼▼▼ LOG 3: VERIFICAR SE O LISTENER RECEBE DADOS ▼▼▼
      console.log("ONGNotificationsScreen - Listener do Firestore acionado! Qtd docs:", querySnapshot.size); 
      const fetchedNotifications: NotificationItem[] = [];
      querySnapshot.forEach((doc) => {
        // ▼▼▼ LOG 4: VERIFICAR DADOS DE CADA DOC ▼▼▼
        console.log("ONGNotificationsScreen - Notificação do Firestore:", doc.id, doc.data()); 
        fetchedNotifications.push({ id: doc.id, ...doc.data() } as NotificationItem);
      });
      // ▼▼▼ LOG 5: VERIFICAR O ARRAY FINAL ANTES DE SETAR O ESTADO ▼▼▼
      console.log("ONGNotificationsScreen - Notificações processadas:", fetchedNotifications); 
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
         console.log(`Notificação ${notificationId} marcada como lida.`);
     } catch (error) {
         console.error("Erro ao marcar notificação como lida:", error);
     }
  };

  // 4. Função para navegar ao clicar (opcional)
  const handleNotificationPress = (item: NotificationItem) => {
    console.log("Notificação clicada:", item);
    // Marcar como lida ao clicar
    if (!item.read) {
        markAsRead(item.id);
    }

    // Exemplo de navegação (adapte à sua necessidade e telas)
    // Se for uma notificação de submissão de animal, talvez navegar
    // para uma tela de detalhes da submissão?
    // if (item.requestId && item.animalId) {
    //   navigation.navigate('SubmissionDetailsScreen', { submissionId: item.requestId });
    // }
  };

  // 5. Renderizar item da lista
  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
        style={[styles.notificationItem, !item.read && styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
    >
      {/* <Text style={{color: 'red', fontWeight: 'bold'}}>-- ITEM RENDER TEST --</Text>*/}
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationBody}>{item.body}</Text>
      {item.timestamp && (
        <Text style={styles.notificationTime}>
          {new Date(item.timestamp?.toDate()).toLocaleString('pt-BR')}
        </Text>
      )}
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar backgroundColor={Theme.TERTIARY} barStyle="light-content" />
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Theme.BACK }}>
        {/* Header (seu código original) */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Notificações
          </Text>
        </View>

        {/* Corpo da Tela */}
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color={Theme.PRIMARY} style={{ marginTop: 50 }}/>
          ) : notifications.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma notificação encontrada.</Text>
          ) : (
            <FlatList
              data={notifications}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 20 }} // Espaço no final
            />
          )}
        </View>
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
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2, // Sombra no Android
        shadowColor: '#000', // Sombra no iOS
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        position: 'relative', // Para o ponto de não lido
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
        marginTop: 8,
        textAlign: 'right',
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
    }
});