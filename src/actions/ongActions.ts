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
  description: string,
    species: string
): Promise<boolean> => {
  try {
    const addressResponse = await axios.post(`${USER_ROUTE}/address`, address);

    if (addressResponse.status !== 200) {
      Alert.alert('Erro', 'Falha ao criar endereço.');
      return false;
    }

    const addressId = addressResponse.data.data.id;

    const ongResponse = await axios.post(`${USER_ROUTE}/ong`, {
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
      description,
        species
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

export const fetchLoggedOng = async (): Promise<any> => {
  const token = await AsyncStorage.getItem('authToken');
  const email = await AsyncStorage.getItem('userEmail');
  if (!token || !email) return null;
  const res = await axios.get(`${USER_ROUTE}/ong`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.data.find((o: any) => o.email === email);
};


export const updateOng = async (updateDto: any) => {
  const token = await AsyncStorage.getItem('authToken');
  return axios.put(`${USER_ROUTE}/ong`, updateDto, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const deleteOngPhotos = async (ongId: number, photoIdsToDelete: number[]) => {
  const token = await AsyncStorage.getItem('authToken');
  return axios.post(
    `${USER_ROUTE}/ong/delete-photo`,
    { ongId, photoIdsToDelete },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const updateAnimal = async (animalObj: any) => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) throw new Error('Token não encontrado');
  const response = await axios.put(
    `${USER_ROUTE}/animal/${animalObj.id}`,
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

export const deleteAnimalPhoto = async (animalId: number, photoId: number) => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) throw new Error('Token não encontrado');
  const response = await axios.delete(
    `${USER_ROUTE}/animal/photo/${animalId}/${photoId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }
  );
  return response.data;
};

export const fetchAnimalsByOng = async (ongId: number): Promise<any[]> => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) throw new Error('Token não encontrado');
  const response = await axios.get(
    `${USER_ROUTE}/animal/ong/${ongId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data.data || [];
};

export const fetchUserAnimals = async (ongId: number): Promise<any[]> => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) throw new Error('Token não encontrado');
  const response = await axios.get(
    `${USER_ROUTE}/animal/requests/${ongId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data.data || [];
};

export const updateAnimalStatus = async (animal: any, status: boolean) => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) throw new Error('Token não encontrado');
  const response = await axios.put(
    `${USER_ROUTE}/animal/status/${animal.id}`,
    { ...animal, status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};