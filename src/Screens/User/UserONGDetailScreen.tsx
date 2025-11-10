import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Pressable, ScrollView, FlatList, TouchableOpacity, Alert, Linking, StatusBar } from 'react-native';
import { Theme } from '../../../constants/Themes';
import Ionicons from '@expo/vector-icons/Ionicons';
import DogCard from '../../Components/DogCard';
import { fetchAnimalsByOng } from '../../actions/ongActions';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../Components/CustomButton';
import { createChatRoom } from '../../actions/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';



export default function UserONGDetailScreen({ route }: any) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const { ong } = route.params;
  const { width, height } = Dimensions.get('window');
  const [current, setCurrent] = useState(0);

  const photos = ong.photos || [];

  const handleNext = () => {
    if (current < photos.length - 1) setCurrent(current + 1);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };


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
                  style={{ width, height: '100%' }}
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
              <View style={{ backgroundColor: Theme.INPUT, width: '100%', height: height * 0.5, justifyContent: 'center', alignItems: 'center', borderRadius: 12 }}>
                <Text style={{ color: '#888', fontSize: 18 }}>Nenhuma foto disponível</Text>
              </View>
            )}
          </View>
          <View style={[{ flex: 1 }]}>
            <View style={[styles.info, { marginTop: -50 }]}>
              <Text style={styles.name}>{ong.name}</Text>
              <View style={{ flexDirection: 'row', padding: 16, paddingBottom: 0, paddingTop: 0 }}>
                <Ionicons name="location-outline" size={24} color={'#555'} style={{ marginRight: 8 }} />
                <Text style={styles.value}>{ong.address.city}/{ong.address.state}</Text>
              </View>
              <View style={{ flexDirection: 'row', padding: 16, paddingBottom: 16, paddingTop: 16 }}>
                <Ionicons name="cash-outline" size={24} color={'#555'} style={{ marginRight: 8 }} />
                <Text style={styles.label}>Pix:</Text>

                <Text style={styles.value}>{ong.pix}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => {
              if (ong) {
                navigation.navigate('UserAnimalONG', { ong });
              } else {
                Alert.alert('ONG não encontrada', 'A ONG associada a este animal não foi encontrada.');
              }
            }} style={[styles.info, { flexDirection: 'row', alignItems: 'center' }]}>
              <View style={{ backgroundColor: Theme.PASTEL, borderRadius: 10, margin: 8, padding: 16 }}>
                <Ionicons name="paw-outline" size={22} color={Theme.PRIMARY} style={{}} />
              </View>
              <Text style={[styles.value, { color: 'black', width: '75%' }]}>Animais desta ONG</Text>
              <Ionicons name="chevron-forward" size={22} color={Theme.PRIMARY} style={{}} />
            </TouchableOpacity>

            <View style={[styles.info, { paddingTop: 16, paddingBottom: 24 }]}>
              <View style={[styles.row, { flexDirection: 'column' }]}>
                <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20, color: Theme.TERTIARY }}>Sobre a ONG</Text>
                <Text style={styles.label}>Descrição da ONG:</Text>
                <Text style={[styles.value]}>
                  {ong.description}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>E-mail:</Text>
                <Text style={styles.value}>{ong.email}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Telefone:</Text>
                <Text style={styles.value}>{ong.phone}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>CNPJ:</Text>
                <Text style={styles.value}>{ong.cnpj}</Text>

              </View>

              <View style={[styles.row, { flexDirection: 'column' }]}>
                <Text style={styles.label}>Endereço:</Text>
                <Text style={[styles.value]}>
                  {ong.address.street}, {ong.address.number}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>CEP:</Text>
                <Text style={styles.value}>{ong.address.zipCode}</Text>
              </View>
            </View>

           

          </View>


        </ScrollView>
         <View style={styles.footer}>
              <CustomButton
                color={Theme.BACK}
                textColor={Theme.PRIMARY}
                borderColor={Theme.PRIMARY}
                title='Doar animal'
                onPress={() => {
                  navigation.navigate('UserDonateAnimal', { ongId: ong.id });
                }}
                buttonStyle={styles.footerButton}
                textStyle={{ fontSize: 14, fontFamily: 'Poppins-SemiBold' }}

              />
              <CustomButton
                color={Theme.TERTIARY}
                title='Conversar com ONG'
                onPress={chatWithOng}
                buttonStyle={styles.footerButton}
                textStyle={{ fontSize: 14, fontFamily: 'Poppins-SemiBold' }}
              />
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
    padding: 16,
    paddingBottom: 0,
    fontFamily: 'Poppins-Bold',
  },
  row: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 0
  },
  label: {
    fontSize: 14,
    marginRight: 4,
    fontFamily: 'Poppins-Bold',
  },
  value: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Poppins-Regular',
  },
});