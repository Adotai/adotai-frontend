import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import Constants from 'expo-constants';

const USER_ROUTE = Constants.expoConfig?.extra?.USER_ROUTE;

if (!USER_ROUTE) {
  console.error('USER_ROUTE is not defined in app.json');
}

export const handleLogin = async (email: string, password: string): Promise<boolean> => {
  try {
    const response = await axios.post(`${USER_ROUTE}/login`, {
      email,
      password,
    });

    console.log('Response data:', response.data); 

    const { data } = response.data; 

    if (response.status === 200 && data.token) {
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('userEmail', email);

      console.log('Token and email successfully saved in AsyncStorage');
      return true;
    } else {
      Alert.alert('Error', 'Failed to receive token or user information.');
      return false;
    }
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 400) {
        Alert.alert('Error', 'Invalid credentials. Check your email or password.');
      } else {
        Alert.alert('Error', data?.message || 'An error occurred on the server.');
      }
    } else {
      console.error('Request error:', error);
      Alert.alert('Error', 'Could not connect to the server. Check your connection.');
    }
    return false;
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

    if (addressResponse.status !== 200 ) {
      Alert.alert('Error', 'Failed to create address.');
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
      Alert.alert('Success', 'User registered successfully!');
      return true;
    } else {
      Alert.alert('Error', 'Failed to register user.');
      return false;
    }
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response;
      Alert.alert('Error', data?.message || 'An error occurred on the server.');
    } else {
      console.error('Request error:', error);
      Alert.alert('Error', 'Could not connect to the server. Check your connection.');
    }
    return false;
  }
};

