import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../../constants/Themes';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { adoptAnimal } from '../../actions/ongActions'; // Sua action que chama o backend

export default function SelectAdopterScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { animal } = (route.params as any) || {};
  const [interestedUsers, setInterestedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterestedUsers = async () => {
      try {
        // Busca apenas solicitações para ESTE animal
        const q = query(
          collection(db, 'adoptionRequests'),
          where('animalId', '==', String(animal.id))
          // Opcional: where('status', '==', 'pending')
        );
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map(doc => ({
          id: doc.id,      // ID da solicitação no Firestore
          ...doc.data()    // Contém userId, userName, etc.
        }));
        setInterestedUsers(users);
      } catch (error) {
        console.error("Erro ao buscar interessados:", error);
        Alert.alert("Erro", "Não foi possível carregar a lista de interessados.");
      } finally {
        setLoading(false);
      }
    };

    if (animal?.id) {
      fetchInterestedUsers();
    }
  }, [animal]);

  const handleSelectUser = (request: any) => {
    Alert.alert(
      "Confirmar Adoção",
      `Confirmar que ${animal.name} será adotado por ${request.userName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar Adoção",
          onPress: async () => {
            try {
              // Chama sua API Java para registrar a adoção
              // request.userId é o ID do usuário que fez a solicitação
              await adoptAnimal(animal, Number(request.userId), request.userName);              
              Alert.alert("Sucesso!", "Adoção registrada com sucesso.");
              navigation.goBack(); // Volta para a tela inicial da ONG
            } catch (error) {
              Alert.alert("Erro", "Falha ao registrar adoção no sistema.");
            }
          }
        }
      ]
    );
  };

  return (
    <>
      <StatusBar backgroundColor={Theme.TERTIARY} barStyle="light-content" />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Theme.BACK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Selecionar Adotante</Text>
        </View>

        <Text style={styles.subtitle}>
          Pessoas que demonstraram interesse em {animal.name}:
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={Theme.PRIMARY} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={interestedUsers}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Ninguém demonstrou interesse neste animal ainda pelo app.</Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.userCard} onPress={() => handleSelectUser(item)}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={24} color={Theme.PRIMARY} />
                </View>
                <View style={{flex: 1}}>
                    <Text style={styles.userName}>{item.userName || 'Usuário sem nome'}</Text>
                    <Text style={styles.userDate}>
                        Interesse em: {item.requestTimestamp?.toDate().toLocaleDateString('pt-BR') || '-'}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
              </TouchableOpacity>
            )}
            contentContainerStyle={{ padding: 16 }}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.BACK },
  header: {
    backgroundColor: Theme.TERTIARY,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  backButton: { position: 'absolute', left: 16, padding: 8 },
  headerTitle: { color: 'white', fontSize: 18, fontFamily: 'Poppins-Bold' },
  subtitle: {
      padding: 16,
      fontSize: 16,
      color: Theme.TERTIARY,
      fontFamily: 'Poppins-SemiBold'
  },
  userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 12,
      marginBottom: 10,
      elevation: 2
  },
  avatar: {
      width: 48, height: 48, borderRadius: 24, backgroundColor: Theme.PASTEL,
      justifyContent: 'center', alignItems: 'center', marginRight: 16
  },
  userName: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#333' },
  userDate: { fontSize: 12, color: '#888', fontFamily: 'Poppins-Regular' },
  emptyText: {
      textAlign: 'center', color: '#888', fontSize: 16, marginTop: 40,
      fontFamily: 'Poppins-Regular', paddingHorizontal: 32
  }
});