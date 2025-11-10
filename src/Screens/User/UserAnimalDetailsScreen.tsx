import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Pressable, ScrollView, TouchableOpacity, Alert, Linking, StatusBar } from 'react-native';
import { Theme } from '../../../constants/Themes';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import CustomButton from '../../Components/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, serverTimestamp, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from '../../services/firebaseConfig';
import { fetchAnimalById, fetchAnimalNameById } from '../../actions/userActions';
import { toggleLikeAnimal, checkIsLiked, getAnimalLikeCount } from '../../actions/likeActions'; // Importe as actions 
import { fetchOngs } from '../../actions/userActions';
import { createChatRoom } from '../../actions/actions';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function UserAnimalDetailsScreen({ route }: any) {

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const { animal, city, ongName, ongs, fromOngList } = route.params;
  const ong = ongs?.find((o: any) => o.name === ongName || o.id === animal.ongId);
  const { width, height } = Dimensions.get('window');
  const [current, setCurrent] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const photos = animal.photos || [];
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const checkLikeStatus = async () => {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        setCurrentUserId(user.id);
        // Verifica no Firestore
        const liked = await checkIsLiked(user.id, animal.id);
        setIsLiked(liked);
      }
    };
    checkLikeStatus();
  }, [animal.id]);

  const handleLikePress = async () => {
    if (!currentUserId) return;

    // Atualização otimista (muda a cor na hora)
    setIsLiked(prev => !prev);

    try {
      // Chama o Firebase em background
      await toggleLikeAnimal(currentUserId, animal, city);
    } catch (error) {
      // Se der erro, reverte
      setIsLiked(prev => !prev);
      Alert.alert("Erro", "Não foi possível curtir o animal.");
    }
  };

  const handleInterestPress = async () => {
    // setLoadingInterest(true); // Se você tiver um estado de loading para o botão
    try {
      // 1. Obter dados do usuário logado do AsyncStorage
      const userString = await AsyncStorage.getItem('user');
      if (!userString) {
        Alert.alert("Erro", "Sessão inválida. Faça login novamente.");
        return;
      }
      const loggedInUser = JSON.parse(userString);
      const userId = loggedInUser?.id;
      const userName = loggedInUser?.name || 'Um usuário';

      // 2. Obter IDs do animal e ONG
      const animalId = animal?.id;
      const ongId = animal?.ongId;

      if (!userId || !animalId || !ongId) {
        console.error("Dados faltando:", { userId, animalId, ongId });
        Alert.alert("Erro", "Não foi possível registrar o interesse. Dados incompletos.");
        return;
      }

      // --- VERIFICAÇÃO DE DUPLICIDADE ---
      // Verifica se já existe uma solicitação deste usuário para este animal
      const q = query(
        collection(db, "adoptionRequests"),
        where("userId", "==", String(userId)),
        where("animalId", "==", String(animalId))
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Alert.alert("Atenção", "Você já registrou interesse neste animal! Aguarde o contato da ONG.");
        // setLoadingInterest(false);
        return; // Para a execução aqui
      }
      // ----------------------------------

      // 3. Buscar o Nome do Animal via Action (pois não temos ele completo aqui às vezes)
      console.log("Buscando nome do animal via action...");
      // Certifique-se de importar fetchAnimalNameById
      const fetchedAnimalName = await fetchAnimalNameById(animalId);
      const animalName = fetchedAnimalName || animal.name || 'um animal';
      console.log(`Nomes confirmados: User='${userName}', Animal='${animalName}'`);

      // 4. Preparar dados para Firestore
      const requestData = {
        userId: String(userId),
        animalId: String(animalId),
        ongId: String(ongId),
        userName: userName,      // Nome do usuário para a notificação
        animalName: animalName,  // Nome do animal para a notificação
        requestTimestamp: serverTimestamp(),
        status: 'pending'
      };

      // 5. Adicionar o documento
      await addDoc(collection(db, "adoptionRequests"), requestData);
      Alert.alert("Interesse Registrado!", "Seu interesse foi enviado para a ONG.");

    } catch (error) {
      console.error("Erro geral ao registrar interesse: ", error);
      Alert.alert("Erro", "Não foi possível registrar seu interesse. Tente novamente.");
    } finally {
      // setLoadingInterest(false);
    }
  };

  const handleNext = () => {
    if (current < photos.length - 1) setCurrent(current + 1);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const handlePress = async (animalId: number) => {
    try {
      // 1. Busca o animal
      const fullAnimalData = await fetchAnimalById(animalId);

      if (fullAnimalData) {
        // 2. Busca a ONG deste animal para ter os dados completos (nome, endereço)
        // Idealmente, sua API deveria ter um endpoint GET /ong/{id}
        // Se não tiver, usamos fetchOngs() e procuramos na lista (menos eficiente, mas funciona)
        const allOngs = await fetchOngs();
        const ongData = allOngs.find(o => o.id === fullAnimalData.ongId);

        if (ongData) {
          navigation.navigate('UserAnimalDetails', {
            animal: fullAnimalData,
            city: ongData.address?.city || 'Cidade não disponível',
            ongName: ongData.name || 'ONG',
            ongs: allOngs, // Passa a lista completa se a tela de detalhes precisar
            fromOngList: false
          });
        } else {
          Alert.alert("Aviso", "Dados da ONG não encontrados.");
          // Navega mesmo assim, mas com dados parciais
          navigation.navigate('UserAnimalDetails', {
            animal: fullAnimalData,
            city: 'Cidade não disponível',
            ongName: 'ONG desconhecida',
            ongs: [],
            fromOngList: false
          });
        }
      } else {
        Alert.alert("Erro", "Não foi possível carregar os detalhes deste animal.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao abrir detalhes.");
    }
  }

  const chatWithOng = async () => {

    try {

      const userJson = await AsyncStorage.getItem('user');

      console.log(userJson);

      const user = userJson ? JSON.parse(userJson) : null;

      if (!user?.id) {

        Alert.alert('Erro', 'Usuário não encontrado.');

        return;

      }

      const chatRoom = await createChatRoom(user.id, ong.id);

      if (chatRoom?.id) {

        navigation.navigate('Chat', { chatId: String(chatRoom.id), loggedInUserId: user.id });

      } else {

        Alert.alert('Erro', 'Não foi possível criar o chat.');

      }

    } catch (e) {

      Alert.alert('Erro', 'Não foi possível criar o chat.');

    }

  }


  useEffect(() => {
    // 1. Cria a query para buscar os likes deste animal
    const q = query(
      collection(db, 'userLikes'),
      where('animalId', '==', animal.id)
    );

    // 2. Liga o listener em tempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // 'snapshot.size' te dá o número exato de documentos encontrados
      setLikeCount(snapshot.size);
    }, (error) => {
      console.error("Erro ao ouvir likes em tempo real:", error);
    });

    // 3. Desliga o listener quando sair da tela
    return () => unsubscribe();
  }, [animal.id]);

  return (
    <>
      <StatusBar backgroundColor='transparent' barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1, backgroundColor: Theme.BACK }} edges={['bottom']}>

        <ScrollView style={{ flex: 1 }}>
          <View style={{ width, height: height * 0.55, position: 'relative', alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>
            {photos.length > 0 ? (
              <>
                <Image
                  source={{ uri: photos[current]?.photoUrl }}
                  style={{ width, height: "100%", }}
                />
                <Pressable
                  style={{ position: 'absolute', left: 0, top: 0, width: width / 2, height: '100%' }}
                  onPress={handlePrev}
                />
                <Pressable
                  style={{ position: 'absolute', right: 0, top: 0, width: width / 2, height: '100%' }}
                  onPress={handleNext}
                />
                <View style={[styles.progressBarContainer, { position: 'absolute', bottom: 64, left: 0, right: 0 }]}>
                  {photos.map((_: any, idx: number) => (
                    <View
                      key={idx}
                      style={[
                        styles.progressBar,
                        idx === current
                          ? styles.progressBarActive
                          : styles.progressBarInactive,
                      ]}
                    />
                  ))}
                </View>
              </>
            ) : (
              <View style={{ width: '100%', height: height * 0.5, justifyContent: 'center', alignItems: 'center', borderRadius: 12 }}>
                <Text style={{ color: '#888', fontSize: 18 }}>Nenhuma foto disponível</Text>
              </View>
            )}
          </View>
          <View style={{ flex: 1 }} >
            <View style={[styles.info, { marginTop: -50 }]}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{animal.name}</Text>
                <View style={styles.likeContainer}>
                  
                  <TouchableOpacity onPress={handleLikePress} style={styles.likeButton}>
                    <Ionicons
                      name={isLiked ? "heart" : "heart-outline"}
                      size={28}
                      color={isLiked ? Theme.PRIMARY : Theme.TERTIARY}
                    />
                   
                  </TouchableOpacity>
                  <Text style={styles.likeCountText}>
                    {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                  </Text>
                </View>
              </View>
              <View style={[{ flexDirection: 'row', padding: 16, paddingBottom: 8, paddingTop: 0 }]}>
                <Ionicons name="paw-outline" size={24} color={'#555'} />
                <Text style={[styles.value, { marginLeft: 8 }]}>{animal.species === 'DOG' ? 'Cachorro' : 'Gato'}</Text>
                <Text style={styles.value}> - </Text>
                <Text style={styles.value}>{animal.breed}</Text>
              </View>
              <View style={[{ paddingLeft: 16, paddingBottom: 8, flexDirection: 'row' }]}>
                <Ionicons
                  name={animal.gender === 'male' ? 'male' : 'female'}
                  size={24}
                  color={'#555'}
                />
                <Text style={[styles.value, { marginLeft: 8 }]}>{animal.gender === 'male' ? 'Macho' : 'Fêmea'}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingBottom: 16 }}>
                <Ionicons name="location-outline" size={24} color={'#555'} style={{ marginRight: 8 }} />
                <Text style={[styles.value]}>{city}</Text>
              </View>
            </View>

            {/* <View style= {{width: width*0.9, alignSelf:'center', backgroundColor: Theme.INPUT, height: 1}}></View> */}
            {!fromOngList && (
              <TouchableOpacity onPress={() => {
                if (ong) {
                  navigation.navigate('UserONGDetail', { ong });
                } else {
                  Alert.alert('ONG não encontrada', 'A ONG associada a este animal não foi encontrada.');
                }
              }} style={[styles.info, { flexDirection: 'row', alignItems: 'center' }]}>
                <View style={{ backgroundColor: Theme.PASTEL, borderRadius: 10, margin: 8, padding: 16 }}>
                  <Ionicons name="globe-outline" size={22} color={Theme.PRIMARY} />
                </View>
                <Text style={[styles.value, { color: 'black', width: '75%' }]}>{ongName}</Text>
                <Ionicons name="chevron-forward" size={22} color={Theme.PRIMARY} />
              </TouchableOpacity>
            )}



            <View style={[styles.info, { paddingLeft: 16, paddingTop: 16, paddingBottom: 16 }]}>
              <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20, color: Theme.TERTIARY }}>Sobre o Animal</Text>
              <View style={[styles.row, { flexDirection: 'column' }]}>
                <Text style={[styles.label]}>Descrição do animal:</Text>
                <Text style={styles.value}>{animal.animalDescription}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Cor:</Text>
                <Text style={styles.value}>{animal.color}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Idade:</Text>
                <Text style={styles.value}>{animal.age} anos</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Saúde:</Text>
                <Text style={styles.value}>
                  {animal.health === 'healthy' && 'Saudável'}
                  {animal.health === 'sick' && 'Doente'}
                  {animal.health === 'disabled' && 'Deficiente'}
                  {animal.health === 'recovering' && 'Recuperando'}
                  {animal.health === 'unknown' && 'Indefinido'}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Temperamento:</Text>
                <Text style={styles.value}>
                  {animal.temperament === 'calm' && 'Calmo'}
                  {animal.temperament === 'playful' && 'Brincalhão'}
                  {animal.temperament === 'aggressive' && 'Agressivo'}
                  {animal.temperament === 'shy' && 'Tímido'}
                  {animal.temperament === 'protective' && 'Protetor'}
                  {animal.temperament === 'sociable' && 'Sociável'}
                  {animal.temperament === 'independent' && 'Independente'}
                  {animal.temperament === 'unknown' && 'Indefinido'}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Porte:</Text>
                <Text style={styles.value}>
                  {animal.size === 'medio' && 'Médio'}
                  {animal.size === 'pequeno' && 'Pequeno'}
                  {animal.size === 'grande' && 'Grande'}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Vacinado:</Text>
                <Text style={styles.value}>{animal.vaccinated ? 'Sim' : 'Não'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Castrado:</Text>
                <Text style={styles.value}>{animal.neutered ? 'Sim' : 'Não'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Vermifugado:</Text>
                <Text style={styles.value}>{animal.dewormed ? 'Sim' : 'Não'}</Text>
              </View>
            </View>

          </View>
        </ScrollView>
        <View style={styles.footer}>
          {animal.status === true ? (
            <>
              <CustomButton
                color={Theme.BACK}
                title='Tenho Interesse'
                onPress={handleInterestPress}
                buttonStyle={styles.footerButton}
                textStyle={{ fontSize: 14, fontFamily: 'Poppins-SemiBold', color: Theme.PRIMARY }}
              />
              <CustomButton
                color={Theme.TERTIARY}
                title='Conversar com ONG'
                onPress={chatWithOng}
                buttonStyle={styles.footerButton}
                textStyle={{ fontSize: 14, fontFamily: 'Poppins-SemiBold' }}
              />
            </>
          ) : null
        }
        </View>
      </SafeAreaView>
    </>

  );
}

const styles = StyleSheet.create({
  progressBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 8,
  },
  footer: {
    flexDirection: 'row', // Botões lado a lado
    padding: 16,
    backgroundColor: '#fff', // Fundo branco para destacar
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'space-between', // Espaço entre os botões
    alignItems: 'center',
    elevation: 10, // Sombra para ficar "flutuando" sobre o conteúdo
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerButton: {
    flex: 1, // Cada botão ocupa metade do espaço
    marginHorizontal: 6, // Espacinho entre eles
    height: 50, // Altura fixa para ficarem alinhados
    justifyContent: 'center',
    borderColor: 'transparent'
  },
  likeCountText: {
    fontSize: 16,
    color: Theme.TERTIARY, // Ou outra cor que destaque
    marginLeft: 8,
    fontFamily: 'Poppins-Medium',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16, // Espaço para o coração não grudar na borda direita
  },
  likeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Theme.PASTEL, // Um fundinho para destacar
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 12
  },
  progressBar: {
    height: 7,
    borderRadius: 3,
    marginHorizontal: 3,
    borderColor: Theme.INPUT,
    width: 60,
  },
  progressBarActive: {
    backgroundColor: Theme.TERTIARY,
  },
  progressBarInactive: {
    backgroundColor: Theme.BACK,
  },
  info: {
    marginTop: 0,
    margin: 8,
    elevation: 3,
    padding: 8,
    borderRadius: 10,
    backgroundColor: Theme.CARD
  },
  name: {
    fontSize: 22,
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
    padding: 16,
    paddingBottom: 0,
    flex: 1,
  },
  likeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    padding: 4,
    paddingLeft: 0
  },
  label: {
    fontSize: 14,
    marginRight: 4,
    fontFamily: 'Poppins-SemiBold'
  },
  value: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Poppins-Regular',
  },
});