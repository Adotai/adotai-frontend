import { StyleSheet, Text, View, Image, Dimensions, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import React from 'react';
import { Theme } from '../../../constants/Themes';
import { TextInput } from 'react-native-paper';
import CustomButton from '../../Components/CustomButton';
import { StatusBar } from 'expo-status-bar';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types';

const { width, height } = Dimensions.get('window');

const inputTheme = {
  colors: {
    primary: Theme.PRIMARY,
    text: '#222',
    placeholder: Theme.PRIMARY,
    background: '#fff',
    outline: '#ccc'
  },
  roundness: 10,
};


function maskPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
}

function maskCpf(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export default function UserSignUpScreen() {
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
          <Text style={styles.loginText}>Informações pessoais</Text>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
              <TextInput
                label="Nome"
                mode="outlined"
                value={name}
                onChangeText={setName}
                style={styles.input}
                theme={inputTheme}
                autoCapitalize="words"
              />
              <TextInput
                label="E-mail"
                mode="outlined"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                theme={inputTheme}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
              <TextInput
                label="Telefone"
                mode="outlined"
                value={phone}
                onChangeText={text => setPhone(maskPhone(text))}
                style={styles.input}
                theme={inputTheme}
                keyboardType="phone-pad"
                autoComplete="tel"
                maxLength={15}
              />
              <TextInput
                label="CPF"
                mode="outlined"
                value={cpf}
                onChangeText={text => setCpf(maskCpf(text))}
                style={styles.input}
                theme={inputTheme}
                keyboardType="numeric"
                maxLength={15}
              />
              <TextInput
                label="Senha"
                mode="outlined"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                theme={inputTheme}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
              />
              <TextInput
                label="Confirme sua Senha"
                mode="outlined"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
                theme={inputTheme}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
              />
            </ScrollView>

            <CustomButton
              title={'Seguinte'}
              borderColor="transparent"
              textColor={Theme.BACK}
              color={Theme.PRIMARY}
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

                if (!/^\d{11}$/.test(cpf.replace(/\D/g, ''))) {
                  Alert.alert('Erro', 'CPF inválido. Certifique-se de que possui 11 dígitos.');
                  return;
                }

                navigation.navigate('Address', {
                  name,
                  email,
                  telephone: phone,
                  cpf,
                  password,
                  fromOng: false,
                });
              }}
              disabled={false}
              buttonStyle={{ marginBottom: '5%', marginTop: '5%', width: width * .85, alignSelf: 'center' }}
            />
          </KeyboardAvoidingView>
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
    width: width * 1,
    backgroundColor: Theme.BACK,
    alignItems: 'center',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    bottom: 0,
    paddingTop: 20,
    paddingBottom: 20,
  },
  loginText: {
    fontSize: 24,
    color: Theme.PRIMARY,
    fontFamily: 'Poppins-Bold',
    marginTop: 20,
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
    width: width * .85,
    backgroundColor: '#fff',
    alignSelf: 'center',
    borderRadius: 10,
  },
});
