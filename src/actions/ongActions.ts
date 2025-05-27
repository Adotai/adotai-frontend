import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import Constants from 'expo-constants';

const USER_ROUTE = Constants.expoConfig?.extra?.USER_ROUTE;

if (!USER_ROUTE) {
  console.error('USER_ROUTE is not defined in app.json');
}


export const handleSignUpOng = async (
  name: string,
  email: string,
  telephone: string,
  cnpj: string,
  password: string,
  pix: string,
  documents: { socialStatute: string; boardMeeting: string },
  photos: { photoUrl: string }[],
  address: {
    street: string;
    number: number;
    city: string;
    state: string;
    zipCode: string;
  },
  description: string
): Promise<boolean> => {
  try {
    const addressResponse = await axios.post(`${USER_ROUTE}/address`, address);

    if (addressResponse.status !== 200) {
      Alert.alert('Erro', 'Falha ao criar endereço.');
      return false;
    }

    const addressId = addressResponse.data.data.id;

    const ongResponse = await axios.post(`${USER_ROUTE}/ongs`, {
      name,
      phone: telephone,
      cnpj,
      email,
      password,
      pix: pix || '',
      documents,
      photos,
      addressId,
      status: false,
      description
    });

    if (ongResponse.status === 200) {
      Alert.alert('Sucesso', 'ONG cadastrada com sucesso!');
      await AsyncStorage.setItem('ongId', String(ongResponse.data.data.id));
      return true;
    } else {
      Alert.alert('Erro', 'Falha ao cadastrar ONG.');
      return false;
    }
  } catch (error: any) {
    if (error.response) {
      const { data } = error.response;
      Alert.alert('Erro', data?.message || 'Erro no servidor.');
    } else {
      console.error('Request error:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    }
    return false;
  }
};

export const createAnimal = async (animalObj: any): Promise<any> => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) throw new Error('Token não encontrado');
  const response = await axios.post(
    `${USER_ROUTE}/animal`,
    animalObj,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};


