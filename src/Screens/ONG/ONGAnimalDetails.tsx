import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Pressable, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { Theme } from '../../../constants/Themes';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../Components/CustomButton';
import { approveAnimalSubmission, updateAnimalStatus } from '../../actions/ongActions';


export default function ONGAnimalDetails({ route }: any) {

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const { animal } = route.params;
  const { width, height } = Dimensions.get('window');
  const [current, setCurrent] = useState(0);
  const [animalStatus, setAnimalStatus] = useState(animal.status);

  const handleToggleStatus = async () => {
    try {
      await updateAnimalStatus(animal, !animalStatus);
      setAnimalStatus(!animalStatus);
      Alert.alert('Sucesso', `Animal ${!animalStatus ? 'disponível para adoção' : 'marcado como adotado'}!`);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
    }
  };

  const handleApprove = async (animalId: number) => {
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
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.name}>{animal.name}</Text>
              {!animalStatus && (
                <View style={{
                  borderWidth: 2,
                  borderColor: Theme.TERTIARY,
                  borderRadius: 6,
                  
                  padding: 4,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text style={{
                    color: Theme.TERTIARY,
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 14
                  }}>
                    Adotado
                  </Text>
                </View>
              )}
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
        <CustomButton
          title={animalStatus ? "Marcar como Adotado" : "Disponibilizar para Adoção"}
          color={animalStatus ? Theme.PRIMARY : "#B9B9B9"}
          onPress={handleToggleStatus}
          buttonStyle={{ alignSelf: 'center', margin: 16, borderWidth: 0, width: width * 0.95 }}
        />
          <CustomButton
            title="Aprovar Cadastro"
            onPress={() => handleApprove(animal.id)}
            buttonStyle={{ alignSelf: 'center', margin: 16, borderWidth: 0, width: width * 0.95 }}
          />
        

      </ScrollView>
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