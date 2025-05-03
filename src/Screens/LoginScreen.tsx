import { ScrollView, StyleSheet, Text, View, Image, Dimensions, Alert } from 'react-native';
import React from 'react';
import { Theme } from '../../constants/Themes';
import { CustomInput } from '../Components/CustomInput';
import CustomButton from '../Components/CustomButton';
import { NavigationProp, useNavigation } from '@react-navigation/native'; // Import navigation hook
import { RootStackParamList } from '../types'; // Import the route types
import { handleLogin } from '../actions/userActions'; // Import the login function
const { width, height } = Dimensions.get('window');

export default function SignInScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const onLoginPress = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both email and password.');
      return;
    }

    const result = await handleLogin(email, password); // result deve ser { success, role }
    if (result.success) {
      if (result.role === 'admin') {
        navigation.navigate('AdminScreen');
      } else if (result.role === 'ong') {
        navigation.navigate('ONGHome');
      } else {
        navigation.navigate('UserHome');
      }
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
          <ScrollView contentContainerStyle={{ flexGrow: 1, width: '100%' }} keyboardShouldPersistTaps="handled">
            <CustomInput label="E-mail" value={email} onChange={setEmail} />
            <CustomInput label="Senha" value={password} onChange={setPassword} secureTextEntry={true} />
            <Text style={[styles.titleBold, { color: Theme.PRIMARY, fontSize: 16, marginBottom: 10 }]}>
              Esqueceu a senha?
            </Text>
          </ScrollView>

          <CustomButton
            title={'ENTRAR'}
            borderColor="transparent"
            textColor={Theme.BACK}
            color={Theme.TERTIARY}
            onPress={onLoginPress}
            buttonStyle={{ marginBottom: '5%' }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  titleBold: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
  },
  subTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginBottom: 400,
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
    fontFamily: 'Poppins-Bold',
    marginTop: 20,
    marginBottom: 20,
  },
  logo: {
    height: height * 0.3,
    width: width * 0.6,
    marginBottom: 20,
  },
});
