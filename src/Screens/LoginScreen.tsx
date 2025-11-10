import { ScrollView, StyleSheet, Text, View, Image, Dimensions, Alert, Platform } from 'react-native';
import React from 'react';
import { Theme } from '../../constants/Themes';
import { TextInput } from 'react-native-paper'; // Troque CustomInput por TextInput do paper
import CustomButton from '../Components/CustomButton';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { handleLogin, fetchLoggedUser } from '../actions/userActions'; // Importe a função
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../services/firebaseConfig'; // Seu objeto Firestore
import { doc, setDoc } from 'firebase/firestore'; // Funções do Firestore
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { fetchLoggedOng } from '../actions/ongActions';


const { width, height } = Dimensions.get('window');

const inputTheme = {
  colors: {
    primary: Theme.PRIMARY,
    text: '#222',
    placeholder: Theme.PRIMARY,
    outline: '#ccc',
  },
  roundness: 10,
};

export default function SignInScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);


  const onLoginPress = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha e-mail e senha.');
      return;
    }

    const result = await handleLogin(email, password);

    if (result.success && result.role) {
    let loggedInEntity: {
        id?: number; 
        [key: string]: any;
    } | null = null;

      if (result.role === 'ong') {
        //console.log("Login de ONG detectado, buscando dados da ONG...");
        loggedInEntity = await fetchLoggedOng();
      } else { // Para 'normal', 'admin', etc.
        //console.log("Login de Usuário detectado, buscando dados do usuário...");
        loggedInEntity = await fetchLoggedUser();
      }

      //console.log('Dados da entidade logada:', JSON.stringify(loggedInEntity, null, 2));

      if (loggedInEntity && loggedInEntity.id !== undefined && loggedInEntity.id !== null) {
        
        await AsyncStorage.setItem('user', JSON.stringify(loggedInEntity));

        //console.log(`✅ Tentando registrar token para a entidade com ID: ${loggedInEntity.id}`);
        await registerPushToken(loggedInEntity.id);

      } else {
        console.error(`❌ ERRO: Não foi possível obter os dados (ou o ID) para a role: ${result.role}`);
      }

      if (result.role === 'admin') {
        navigation.navigate('AdminScreen');
      } else if (result.role === 'ong') {
        navigation.navigate('ONGHome');
      } else {
        navigation.navigate('UserHome');
      }

    } else {
      Alert.alert('Erro', result.error || 'Não foi possível fazer login.');
    }
  };

  async function registerPushToken(userId: number) {
  let token = '';
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      //console.log('Permissão de notificação não concedida.');
      return;
    }

    try {
      if (Platform.OS === 'android') {
        //console.log("Tentando obter o token NATIVO do FCM...");
        token = (await Notifications.getDevicePushTokenAsync()).data;
        //console.log("Token NATIVO do FCM obtido:", token);
      } else {
        token = (await Notifications.getExpoPushTokenAsync()).data;
        //console.log("Token do Expo obtido:", token);
      }
    } catch (e) {
        console.error("Falha ao obter o token de notificação:", e);
        token = (await Notifications.getExpoPushTokenAsync()).data;
        //console.log("Usando token do Expo como fallback:", token);
    }


    if (token) {
        await setDoc(doc(db, 'users', String(userId)), {
            expoPushToken: token
        }, { merge: true });
        //console.log(`Token salvo para o usuário ${userId}. Verifique o Firestore.`);
    }
    
  } else {
    //console.log('Deve ser um dispositivo físico para receber notificações push.');
  }
}

  return (
    <View style={styles.container}>
      <Image style={styles.backgroundImage} source={require('../../assets/images/background-home.png')} />
      <Image style={styles.logo} source={require('../../assets/images/adotai-logo-png.png')} />
      <Text style={styles.subTitle}>Entre para fazer a diferença na vida de um animal!</Text>

      <View style={styles.overlay}>
        <View style={styles.formContainer}>
          <Text style={styles.loginText}>Login</Text>
          <TextInput
            label="E-mail"
            mode="outlined"
            value={email}
            onChangeText={text => setEmail(text.replace(/\s/g, ''))}
            style={styles.input}
            theme={inputTheme}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextInput
            label="Senha"
            mode="outlined"
            value={password}
            onChangeText={text => setPassword(text.replace(/\s/g, ''))}
            style={styles.input}
            theme={inputTheme}
            secureTextEntry={!showPassword}

            autoCapitalize="none"
            autoComplete="password"
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword((prev) => !prev)}
              />
            }
          />

          <CustomButton
            title={'Entrar'}
            borderColor="transparent"
            textColor={Theme.BACK}
            color={Theme.PRIMARY}
            onPress={onLoginPress}
            buttonStyle={{ marginBottom: '10%', width: width * 0.85, marginTop: '2%' }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleBold: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
  },
  subTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: '80%',
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    width: '100%',
    bottom: 0,
    position: 'absolute',
  },
  formContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: Theme.BACK,
    alignItems: 'center',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    bottom: 0,

  },
  loginText: {
    fontSize: 24,
    color: Theme.PRIMARY,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 20,
    marginBottom: 20,
  },
  logo: {
    height: height * 0.3,
    width: width * 0.6,
    marginBottom: 20,
  },
  input: {
    marginBottom: '5%',
    width: width * 0.85,
    backgroundColor: '#fff',
    alignSelf: 'center',
    borderRadius: 10,
  },
});
