import { StyleSheet, Text, View, Image, ScrollView, Alert } from 'react-native'
import React from 'react'
import { CustomInput } from '../../Components/CustomInput';
import CustomButton from '../../Components/CustomButton';
import { Theme } from '../../../constants/Themes';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types';

export default function ONGSignUpScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [cpf, setCpf] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  return (
    <View style={styles.container}>
      <Image style={styles.backgroundImage} source={require('../../../assets/images/background-home.png')} />
      
      <View style={styles.overlay}>

        <View style={styles.formContainer}>
          <Text style={styles.loginText}>Cadastro ONG</Text>
          <ScrollView contentContainerStyle={{ flexGrow: 1, width: '100%' }} keyboardShouldPersistTaps="handled">

            <CustomInput label="Nome da ONG" value={name} onChange={setName} />
            <CustomInput label="CNPJ" value={cpf} onChange={setCpf} />
            <CustomInput label="E-mail" value={email} onChange={setEmail} />
            <CustomInput label="Telefone" value={phone} onChange={setPhone} />
            <CustomInput label="Senha" value={password} onChange={setPassword} secureTextEntry={true} />
            <CustomInput label="Confirme sua Senha" value={confirmPassword} onChange={setConfirmPassword} secureTextEntry={true} />
          </ScrollView>

          <CustomButton
            title={'SEGUINTE'}
            borderColor="transparent"
            textColor={Theme.BACK}
            color={Theme.TERTIARY}
            onPress={() => {
              if (!name || !email || !phone || !cpf || !password || !confirmPassword) {
                Alert.alert('Erro', 'Todos os campos são obrigatórios.');
                return;
              }
          
              if (password !== confirmPassword) {
                Alert.alert('Erro', 'As senhas não coincidem.');
                return;
              }
          
              if (!/^\S+@\S+\.\S+$/.test(email)) {
                Alert.alert('Erro', 'Formato de e-mail inválido.');
                return;
              }
          
              if (!/^\d{14}$/.test(cpf.replace(/\D/g, ''))) {
                Alert.alert('Erro', 'CNPJ inválido. Certifique-se de que possui 14 dígitos.');
                return;
              }
          
              navigation.navigate('Address', {
                name,
                email,
                telephone: phone,
                cpf,
                password,
              });
            }}
            disabled={false}
            buttonStyle={{ marginBottom: '5%', marginTop: '5%' }}
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
