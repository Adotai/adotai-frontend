import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, StatusBar, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { Theme } from '../../../constants/Themes';
import { Ionicons } from '@expo/vector-icons';
import { downloadCertificate, fetchAnimalById, fetchOngs } from '../../actions/userActions';
import CustomButton from '../../Components/CustomButton';
// Importe a action de gerar PDF (se estiver em ongActions, talvez movê-la para um arquivo comum seja melhor, mas pode importar de lá mesmo)
//import { generateAdoptionCertificate } from '../../actions/ongActions'; 

export default function UserAdoptionsScreen({navigation}: any) {
    const [adoptions, setAdoptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        const getUserId = async () => {
            const userString = await AsyncStorage.getItem('user');
            if (userString) {
                const user = JSON.parse(userString);
                setUserId(user.id);
            } else {
                setLoading(false);
            }
        };
        getUserId();
    }, []);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        // Busca na coleção 'adoptedAnimals' onde userId == MEU ID
        const q = query(
            collection(db, 'adoptedAnimals'),
            where('userId', '==', userId),
            orderBy('adoptedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched: any[] = [];
            snapshot.forEach((doc) => {
                fetched.push({ id: doc.id, ...doc.data() });
            });
            setAdoptions(fetched);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar adoções:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [userId]);


    const handleCardPress = async (item: any) => {
      try {
          // 1. Busca os dados completos do animal
          const fullAnimalData = await fetchAnimalById(item.animalId);
          
          if (fullAnimalData) {
               // 2. Busca dados da ONG para complementar (opcional, mas recomendado para ter cidade/nome)
               // Se sua API já retorna isso dentro de 'fullAnimalData.ong', pode simplificar.
               const allOngs = await fetchOngs();
               const ongData = allOngs.find(o => o.id === item.ongId);

               navigation.navigate('UserAnimalDetails', { 
                   animal: fullAnimalData,
                   city: ongData?.address?.city || 'Cidade não disponível', 
                   ongName: ongData?.name || 'ONG',
                   ongs: allOngs, // <-- Passe a lista completa aqui!
                   fromOngList: false
               });
          } else {
              Alert.alert("Erro", "Não foi possível carregar os detalhes deste animal.");
          }
      } catch (error) {
          console.error(error);
          Alert.alert("Erro", "Falha ao abrir detalhes.");
      }
  }
    const renderItem = ({ item }: { item: any }) => {
        return (
            <TouchableOpacity style={styles.card} onPress={() => handleCardPress(item)}>
                <View style={styles.cardRow}>
                    {item.animalPhoto && (
                        <Image source={{ uri: item.animalPhoto }} style={styles.animalImage} />
                    )}
                    <View style={styles.cardInfo}>
                        <Text style={styles.animalName}>{item.animalName}</Text>
                        <Text style={styles.date}>
                            Adotado em: {item.adoptedAt?.toDate().toLocaleDateString('pt-BR') || '--/--/--'}
                        </Text>
                    </View>
                </View>

                {/* Botão de Certificado */}

                <CustomButton
                    buttonStyle={styles.certificateButton}
                    title="Baixar Certificado"
                    onPress={() => downloadCertificate(item.animalId, item.ongId)}

                />
            </TouchableOpacity>
        );
    };

    return (
        <>
            <StatusBar backgroundColor={Theme.TERTIARY} barStyle="light-content" />
            <SafeAreaView edges={['top']} style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Meus Animais Adotados</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={Theme.PRIMARY} style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={adoptions}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>Você ainda não adotou nenhum animal pelo app.</Text>
                        }
                    />
                )}
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.BACK
    },
    header: {
        padding: 16,
        alignItems: 'center',
        backgroundColor: Theme.TERTIARY,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        color: Theme.BACK
    },
    listContent: {
        padding: 16
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        elevation: 2,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    animalImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginRight: 16,
        backgroundColor: '#eee'
    },
    cardInfo: {
        flex: 1,
        justifyContent: 'center'
    },
    animalName: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
        color: Theme.TERTIARY
    },
    date: {
        fontSize: 14,
        color: '#999',
        fontFamily: 'Poppins-Regular',
        marginTop: 4
    },
    certificateButton: {
        backgroundColor: Theme.PRIMARY,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        width: '100%'
    },
    certificateText: {
        color: '#fff',
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 16,
        marginTop: 50,
        fontFamily: 'Poppins-Regular'
    },
});