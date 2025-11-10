import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Pressable, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { Theme } from '../../../constants/Themes';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { Animal, RootStackParamList } from '../../types';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../Components/CustomButton';
import { approveAnimalSubmission, updateAnimalStatus } from '../../actions/ongActions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, limit, onSnapshot } from 'firebase/firestore'; // Adicione getDocs, limit
import { db } from '../../services/firebaseConfig';


export default function ONGAnimalDetails({ route }: any) {

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const { animal } = route.params;
  const { width, height } = Dimensions.get('window');
  const [current, setCurrent] = useState(0);
  const [animalStatus, setAnimalStatus] = useState(animal.status);
  const [likeCount, setLikeCount] = useState(0);
  const [adopter, setAdopter] = useState<any>(null);

  useEffect(() => {
    if (animalStatus === false) { // Só busca se estiver adotado
        const fetchAdopter = async () => {
            try {
                const q = query(
                    collection(db, 'adoptedAnimals'),
                    where('animalId', '==', animal.id),
                    limit(1) // Só precisamos de 1 registro
                );
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    const adopterData = snapshot.docs[0].data();
                    setAdopter(adopterData);
                }
            } catch (error) {
                console.error("Erro ao buscar adotante:", error);
            }
        };
        fetchAdopter();
    } else {
        setAdopter(null); // Limpa se ficar disponível novamente
    }
  }, [animalStatus, animal.id]);


  useEffect(() => {
    const q = query(
      collection(db, 'userLikes'),
      where('animalId', '==', animal.id)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLikeCount(snapshot.size);
    }, (error) => {
      console.error("Erro ao buscar likes:", error);
    });
    return () => unsubscribe();
  }, [animal.id]);

  const handleApprove = async (animalId: Animal) => {
    try {
      await approveAnimalSubmission(animalId);
      Alert.alert("Sucesso", "O animal foi aprovado!");

    } catch (error) {
      Alert.alert("Erro", "Não foi possível aprovar o animal.");
    }
  };

  const photos = animal.photos || [];

  const handleNext = () => {
    if (current < photos.length - 1) setCurrent(current + 1);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

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
              <View style={styles.headerRow}>
                <Text style={styles.name}>{animal.name}</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {!animalStatus && (
                    <View style={styles.adoptedBadge}>
                      <Text style={styles.adoptedText}>Adotado</Text>
                    </View>
                  )}
                  {animal.solicitationStatus === false ? (
                    <View style={styles.likeContainer}>
                      <Ionicons name="heart" size={24} color={Theme.PRIMARY} />
                      <Text style={styles.likeCountText}>
                        {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                      </Text>
                    </View>
                  ) : null}

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
            </View>
            {adopter && (
                <View style={[styles.info, styles.adopterCard]}>
                    <Text style={styles.sectionTitle}>Adotado por</Text>
                    <TouchableOpacity 
                        style={styles.adopterRow}
                        onPress={() => {
                            navigation.navigate('ONGUserProfile', { user: adopter.userId });                           
                        }}
                    >
                        <View style={styles.adopterAvatar}>
                            <Ionicons name="person" size={30} color={Theme.PRIMARY} />
                        </View>
                        <View>
                            <Text style={styles.adopterName}>{adopter.userName}</Text>
                            <Text style={styles.adoptedDate}>
                                em {adopter.adoptedAt?.toDate().toLocaleDateString('pt-BR') || '-'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#ccc" style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>
                </View>
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
                  {animal.health === 'unknown' && 'Desconhecido'}
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
          {animal.status === false ? <View style= {{width:'100%'}}></View> : (
            animal.solicitationStatus === true ? (
              <CustomButton
                color={Theme.TERTIARY}
                title='Aprovar Cadastro'
                onPress={() => handleApprove(animal.id)}
                buttonStyle={styles.footerButton}
                textStyle={{ fontSize: 16, fontFamily: 'Poppins-SemiBold', color: Theme.BACK }}
              />
            ) : (
              <CustomButton
                title="Registrar Adoção"
                color={Theme.TERTIARY}
                onPress={() => navigation.navigate('SelectAdopter', { animal: animal })}
                buttonStyle={styles.footerButton}
                textStyle={{ fontSize: 16, fontFamily: 'Poppins-SemiBold', color: Theme.BACK }}
              />
            )
          )}
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
  },sectionTitle: {
      fontFamily: 'Poppins-Bold',
      fontSize: 18,
      color: Theme.TERTIARY,
      marginBottom: 12,
      marginLeft: 16,
      marginTop: 16
  },
  adopterCard: {
      padding: 0, // Remove padding padrão para controlar melhor internamente
      overflow: 'hidden' // Para o ripple effect se usar Pressable
  },
  adopterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#fff' // Garante fundo branco
  },
  adopterAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: Theme.PASTEL,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16
  },
  adopterName: {
      fontSize: 18,
      fontFamily: 'Poppins-SemiBold',
      color: '#333'
  },
  adoptedDate: {
      fontSize: 14,
      color: '#888',
      fontFamily: 'Poppins-Regular'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Separa o nome dos badges/likes
    paddingRight: 16, // Espaço na direita
  },

  adoptedBadge: {
    borderWidth: 2,
    borderColor: Theme.TERTIARY,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 8, // Espaço entre o badge e os likes
  },
  adoptedText: {
    color: Theme.TERTIARY,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.PASTEL, // Um fundinho para destacar
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12
  },
  likeCountText: {
    fontSize: 16,
    color: Theme.TERTIARY, // Ou outra cor que destaque
    marginLeft: 8,
    fontFamily: 'Poppins-Medium',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 10,
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
    flex: 1
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