import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Animal, UpdateUserPayload } from '../types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

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
      const msg = error.response.data?.message || 'E-mail ou senha incorretos.';
      return { success: false, error: msg };
    } else {
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

export const acceptOng = async (id: number): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    await axios.put(`${USER_ROUTE}/ong/status/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch (error) {
    console.error('Erro ao aceitar ONG:', error);
    return false;
  }
};

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
      return [];
    }
    //console.error('Erro ao buscar animais por estado:', error);
    return [];
  }
};

export const downloadCertificate = async (animalId: number, ongId: number) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const userString = await AsyncStorage.getItem('user');

    if (!token || !USER_ROUTE || !userString) {
        Alert.alert("Erro", "Você precisa estar logado.");
        return;
    }
    
    const user = JSON.parse(userString);
    const userIdNum = Number(user.id);
    const animalIdNum = Number(animalId);
    const ongIdNum = Number(ongId);

    console.log(`Baixando certificado...`);

    // 1. Requisição POST
    const response = await fetch(`${USER_ROUTE}/pdf`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idUser: userIdNum, idAnimal: animalIdNum, idOng: ongIdNum })
    });

    if (!response.ok) throw new Error("Falha ao gerar PDF no servidor.");

    // 2. Processa o Blob
    const blob = await response.blob();
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
        try {
            const base64data = reader.result as string;
            const base64Content = base64data.split(',')[1];
            const filename = `certificado_${animalIdNum}.pdf`;
            const fileUri = `${FileSystem.documentDirectory}${filename}`;

            // 3. Salva no cache do app
            await FileSystem.writeAsStringAsync(fileUri, base64Content, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // 4. Abre o menu de compartilhar (Funciona bem em ambos)
            if (Platform.OS === 'android') {
                try {
                    // Tenta compartilhar o arquivo diretamente
                    await Sharing.shareAsync(fileUri, {
                        mimeType: 'application/pdf',
                        dialogTitle: 'Salvar Certificado',
                        UTI: 'com.adobe.pdf' // Ajuda a definir o tipo de arquivo
                    });
                } catch (error) {
                    Alert.alert("Erro", "Não foi possível abrir o menu de compartilhamento.");
                }
            } else {
                Alert.alert("Erro", "Compartilhamento não disponível neste dispositivo.");
            }

        } catch (e) {
            console.error("Erro ao salvar/compartilhar:", e);
            Alert.alert("Erro", "Não foi possível salvar o arquivo.");
        }
    };

  } catch (error) {
    console.error("Erro geral:", error);
    Alert.alert("Erro", "Falha ao baixar o certificado.");
  }
};


export const fetchLoggedUser = async (): Promise<any | null> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const email = await AsyncStorage.getItem('userEmail');
    if (!token || !email) return null;

    const response = await axios.get(`${USER_ROUTE}/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Encontra o usuário logado na lista
    const user = response.data.data?.find((u: any) => u.email === email);
    if (!user) return null;

    // Retorna o objeto COMPLETO, incluindo os novos campos
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      phone: user.telephone,
      city: user.address?.city,
      state: user.address?.state,
      address: user.address,
      // ▼▼▼ NOVOS CAMPOS ADICIONADOS ▼▼▼
      birthDate: user.birthDate,
      gender: user.gender,
      houseType: user.houseType,
      houseSize: user.houseSize,
      animalsQuantity: user.animalsQuantity,
      description: user.description,
      photos: user.photos
      // ▲▲▲ FIM DOS NOVOS CAMPOS ▲▲▲
    };
  } catch (err) {
    console.error('Erro ao buscar dados do usuário:', err);
    return null;
  }
};

export const updateUser = async (user: UpdateUserPayload) => {
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
export const fetchAnimalNameById = async (animalId: number): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token || !USER_ROUTE) return null;

    const response = await axios.get(`${USER_ROUTE}/animal/id/${animalId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // ▼▼▼ A CORREÇÃO ESTÁ AQUI ▼▼▼
    // Verifique a estrutura: response.data -> .data -> .name
    if (response.data && response.data.data && response.data.data.name) {
      return response.data.data.name; // <-- Pega o nome de dentro do objeto aninhado
    } else {
    // ▲▲▲ FIM DA CORREÇÃO ▲▲▲
      console.warn(`Nome não encontrado na resposta da API (estrutura inesperada) para animal ${animalId}`);
      console.log("Estrutura recebida:", JSON.stringify(response.data)); 
      return null;
    }
  } catch (err: any) {
    console.error(`Erro ao buscar nome do animal ${animalId}:`, err.response?.data || err.message);
    return null;
  }
};

export const fetchAnimalById = async (animalId: number): Promise<Animal | null> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token || !USER_ROUTE) return null;

    const response = await axios.get(`${USER_ROUTE}/animal/id/${animalId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data && response.data.data) {
      return response.data.data as Animal;
    } else {
      return null;
    }
  } catch (err: any) {
    console.error(`Erro ao buscar animal ${animalId}:`, err.response?.data || err.message);
    return null;
  }
};

export const deleteUserPhotos = async (userId: number, photoIdsToDelete: number[]) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token || !USER_ROUTE) return null;
    await axios.post(
      `${USER_ROUTE}/user/delete-photo`,
      { id: userId, photoIdsToDelete },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err: any) {
      console.error(`Erro ao deletar fotos do usuário:`, err.response?.data || err.message);
    return null; }
};