import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import Constants from 'expo-constants';

const USER_ROUTE = Constants.expoConfig?.extra?.USER_ROUTE;

if (!USER_ROUTE) {
  console.error('USER_ROUTE is not defined in app.json');
}

export const handleLogin = async (email: string, password: string): Promise<{ success: boolean, role?: string, error?: string }> => {
  try {
    const response = await axios.post(`${USER_ROUTE}/login`, { email, password });
    const { data } = response.data;

    if (response.status === 200 && data.token) {
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('userEmail', email);
      if (data.role) {
        await AsyncStorage.setItem('userRole', data.role);
      }
      if (data.ongId) {
        await AsyncStorage.setItem('ongId', String(data.ongId));
      }
      return { success: true, role: data.role };
    } else {
      return { success: false, error: 'Falha ao receber token ou informações do usuário.' };
    }
  } catch (error: any) {
    if (error.response) {
      // Erro do backend (ex: senha errada)
      const msg = error.response.data?.message || 'E-mail ou senha incorretos.';
      return { success: false, error: msg };
    } else {
      // Erro de rede
      return { success: false, error: 'Erro de conexão. Verifique sua internet.' };
    }
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

    const userResponse = await axios.post(`${USER_ROUTE}/user`, {
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

export const fetchOngs = async (): Promise<any[]> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const response = await axios.get(`${USER_ROUTE}/ong`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data || [];
  } catch (error) {
    //console.error('Erro ao buscar ONGs:', error);
    throw error;
  }
};

// Aceitar ONG (mudar status para true)
export const acceptOng = async (id: number): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    await axios.put(`${USER_ROUTE}/ongs/${id}`, {}, {
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
    await axios.delete(`${USER_ROUTE}/ong/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch (error) {
    console.error('Erro ao deletar ONG:', error);
    return false;
  }
};


export const getLoggedOngId = async (): Promise<number | null> => {
  try {
    const email = await AsyncStorage.getItem('userEmail');
    if (!email) return null;

    const token = await AsyncStorage.getItem('authToken');
    const response = await axios.get(`${USER_ROUTE}/ong`, {
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

export const fetchAnimalsByState = async (uf: string): Promise<any[]> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const response = await axios.get(`${USER_ROUTE}/animal/${uf}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data || [];
  } catch (error: any) {
    if (error.response?.status === 404) {
      // Estado sem animais — retorna array vazio sem logar erro
      return [];
    }
    //console.error('Erro ao buscar animais por estado:', error);
    return [];
  }
};

export const fetchLoggedUser = async (): Promise<{ id?: number, name?: string, city?: string, state?: string, email?: string, cpf?: string , phone?: string, address?: any } | null> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const email = await AsyncStorage.getItem('userEmail');
    if (!token || !email) return null;

    const response = await axios.get(`${USER_ROUTE}/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const user = response.data.data?.find((u: any) => u.email === email);
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      phone: user.telephone,
      city: user.address?.city,
      state: user.address?.state,
      address: user.address, // objeto completo
    };
  } catch (err) {
    console.error('Erro ao buscar dados do usuário:', err);
    return null;
  }
};

export const updateUser = async (user: {
  id: number;
  name: string;
  email: string;
  cpf: string;
  password: string;
  telephone: string;
  address: any;
  addressId: number;
}) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const response = await axios.put(`${USER_ROUTE}/user`, user, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};