import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import Constants from 'expo-constants';

const USER_ROUTE = Constants.expoConfig?.extra?.USER_ROUTE;

if (!USER_ROUTE) {
  console.error('USER_ROUTE is not defined in app.json');
}

export const handleLogin = async (email: string, password: string): Promise<{ success: boolean, role?: string }> => {
  try {
    const response = await axios.post(`${USER_ROUTE}/login`, { email, password });
    console.log('LOGIN RESPONSE:', response.data); // Adicione isso
    const { data } = response.data;

    if (response.status === 200 && data.token) {
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('userEmail', email);
      // Salve a role se vier na resposta
      if (data.role) {
        await AsyncStorage.setItem('userRole', data.role);
      }
      // Salva o id da ONG se vier na resposta
      if (data.ongId) {
        await AsyncStorage.setItem('ongId', String(data.ongId));
      }
      return { success: true, role: data.role };
    } else {
      Alert.alert('Erro', 'Falha ao receber token ou informações do usuário.');
      return { success: false };
    }
  } catch (error: any) {
    // ...tratamento de erro...
    return { success: false };
  }
};

export const handleSignUp = async (
  name: string,
  email: string,
  telephone: string,
  cpf: string,
  password: string,
  address: {
    street: string;
    number: number;
    city: string;
    state: string;
    zipCode: string;
  }
): Promise<boolean> => {
  try {
    const addressResponse = await axios.post(`${USER_ROUTE}/address`, address);

    if (addressResponse.status !== 200) {
      Alert.alert('Erro', 'Falha ao criar endereço.');
      return false;
    }

    const addressId = addressResponse.data.data.id;

    const userResponse = await axios.post(`${USER_ROUTE}/users`, {
      name,
      email,
      telephone,
      cpf,
      password,
      addressId,
      role: 'normal',
    });

    if (userResponse.status === 200) {
      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
      return true;
    } else {
      Alert.alert('Erro', 'Falha ao cadastrar usuário.');
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
  }
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

export const fetchOngs = async (): Promise<any[]> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const response = await axios.get(`${USER_ROUTE}/ongs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Erro ao buscar ONGs:', error);
    throw error;
  }
};

// Aceitar ONG (mudar status para true)
export const acceptOng = async (id: number): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    await axios.patch(`${USER_ROUTE}/ongs/${id}/status`, { status: true }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch (error) {
    console.error('Erro ao aceitar ONG:', error);
    return false;
  }
};

// Deletar ONG
export const deleteOng = async (id: number): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    await axios.delete(`${USER_ROUTE}/ongs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch (error) {
    console.error('Erro ao deletar ONG:', error);
    return false;
  }
};

export const createAnimal = async (animal: {
  ongId: number;
  name: string;
  gender: string;
  color: { name: string };
  breed: { name: string; speciesDescription: string };
  species: { description: string };
  age: number;
  health: string;
  status: boolean;
  vaccinated: boolean;
  neutered: boolean;
  dewormed: boolean;
  temperament: string;
}) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const id = await AsyncStorage.getItem('ongId');
    console.log('ongId salvo:', id);
    const response = await axios.post(`${USER_ROUTE.replace('/ongs', '')}/animal`, animal, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      Alert.alert('Erro', error.response.data?.message || 'Erro ao criar animal.');
    } else {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    }
    throw error;
  }
};

export const getLoggedOngId = async (): Promise<number | null> => {
  try {
    const email = await AsyncStorage.getItem('userEmail');
    if (!email) return null;

    const token = await AsyncStorage.getItem('authToken');
    const response = await axios.get(`${USER_ROUTE}/ongs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const ongs = response.data.data;
    const ong = ongs.find((o: any) => o.email === email);
    return ong ? ong.id : null;
  } catch (error) {
    console.error('Erro ao buscar id da ONG logada:', error);
    return null;
  }
};

export const fetchAnimals = async (): Promise<any[]> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const response = await axios.get(`${USER_ROUTE}/animal`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Erro ao buscar animais:', error);
    return [];
  }
};
