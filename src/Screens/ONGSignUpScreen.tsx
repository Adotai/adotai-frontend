import { StyleSheet, Text, View, Image, ScrollView } from 'react-native'
import React from 'react'
import { CustomInput } from '../Components/CustomInput';
import CustomButton from '../Components/CustomButton';
import { Theme } from '../../constants/Themes';

export default function ONGSignUpScreen() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [cpf, setCpf] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  return (
    <View style={styles.container}>
      <Image style={styles.backgroundImage} source={require('../../assets/background-home.png')} />

      <View style={styles.overlay}>

        <View style={styles.formContainer}>
          <Text style={styles.loginText}>Cadastro ONG</Text>
          <ScrollView contentContainerStyle={{ flexGrow: 1, width: '100%' }} keyboardShouldPersistTaps="handled">

            <CustomInput label="Nome da ONG" value={name} onChange={setName} />
            <CustomInput label="CNPJ" value={cpf} onChange={setCpf} />
            <CustomInput label="E-mail" value={email} onChange={setEmail} />
            <CustomInput label="Senha" value={password} onChange={setPassword} secureTextEntry={true} />
            <CustomInput label="Confirme sua Senha" value={confirmPassword} onChange={setConfirmPassword} secureTextEntry={true} />
            <CustomInput label="Telefone" value={phone} onChange={setPhone} />
          </ScrollView>

          <CustomButton
            title={'SEGUINTE'}
            borderColor='transparent'
            textColor={Theme.BACK}
            color={Theme.TERTIARY}
            onPress={() => { }}
            disabled={false}
            buttonStyle={{ marginBottom: '5%' }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
