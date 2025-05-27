import { ScrollView, StyleSheet, Text, View, Image, Dimensions, Alert } from 'react-native';
import React from 'react';
import { Theme } from '../../constants/Themes';
import { TextInput } from 'react-native-paper'; // Troque CustomInput por TextInput do paper
import CustomButton from '../Components/CustomButton';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { handleLogin } from '../actions/userActions';

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
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);


  const onLoginPress = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha e-mail e senha.');
      return;
    }

    const result = await handleLogin(email, password);
    if (result.success) {
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
            onChangeText={text => setEmail(text.replace(/\s/g, ''))} // Bloqueia espaços
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
            onChangeText={text => setPassword(text.replace(/\s/g, ''))} // Bloqueia espaços
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
