import { ScrollView, StyleSheet, Text, View, Image, Dimensions } from 'react-native'
import React from 'react'
import { Theme } from '../../constants/Themes'
import { CustomInput } from '../Components/CustomInput';
import CustomButton from '../Components/CustomButton';

const { width, height } = Dimensions.get('window');

const SignInScreen = () => {

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  return (
    <View style={styles.container}>
      <Image style={styles.backgroundImage} source={require('../../assets/background-home.png')} />
      <Image style={styles.logo} source={require('../../assets/adotai-logo-png.png')} />
      <Text style={styles.subTitle}>Entre para fazer a diferença na vida de um animal!</Text>

      <View style={styles.overlay}>

        <View style={styles.formContainer}>
          <Text style={styles.loginText}>Login</Text>
          <ScrollView contentContainerStyle={{ flexGrow: 1, width: '100%' }} keyboardShouldPersistTaps="handled">
            <CustomInput label="E-mail" value={email} onChange={setEmail} />
            <CustomInput label="Senha" value={password} onChange={setPassword} secureTextEntry={true} />
            <Text style={[styles.titleBold, { color: Theme.PRIMARY, fontSize: 16, marginBottom: 10 }]}>Esqueceu a senha?</Text>
          </ScrollView>

          <CustomButton
            title={'ENTRAR'}
            borderColor='transparent'
            textColor={Theme.BACK}
            color={Theme.TERTIARY}
            onPress={() => { }}
            disabled={false}
            buttonStyle={{ marginBottom: '5%'}}
          />

        </View>
      </View>
    </View>
  );
}

export default SignInScreen

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
    paddingHorizontal: 20
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
    bottom: 0
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
  }
});
