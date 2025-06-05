import { StyleSheet, Text, View, ImageBackground, ScrollView, Alert, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import React from 'react';
import { TextInput } from 'react-native-paper';
import CustomButton from '../../Components/CustomButton';
import { Theme } from '../../../constants/Themes';
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
    .replace(/\D/g, '') // Remove tudo que não é dígito
    .replace(/^(\d{2})(\d)/g, '($1) $2') // Adiciona parênteses ao DDD
    .replace(/(\d{5})(\d)/, '$1-$2') // Adiciona hífen após o 5º dígito do número
    .replace(/(-\d{4})\d+?$/, '$1'); // Garante que não tenha mais que 4 dígitos depois do hífen
}

function maskCnpj(value: string) {
  return value
    .replace(/\D/g, '') // Remove tudo que não é dígito
    .replace(/^(\d{2})(\d)/, '$1.\$2') // Adiciona ponto após o 2º dígito
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.\$2.\$3') // Adiciona ponto após o 5º dígito
    .replace(/\.(\d{3})(\d)/, '.\$1/\$2') // Adiciona barra após o 8º dígito
    .replace(/(\d{4})(\d)/, '$1-\$2') // Adiciona hífen após o 12º dígito
    .slice(0, 18); // Limita a 18 caracteres (XX.XXX.XXX/XXXX-XX)
}

export default function ONGSignUpScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [cnpj, setCnpj] = React.useState(''); 
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  return (
    <View style={styles.container}>
      <ImageBackground style={styles.backgroundImage} source={require('../../../assets/images/background-home.png')} />

      <View style={styles.overlay}>
        <View style={styles.formContainer}>
          <Text style={styles.loginText}>Cadastro ONG</Text>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            <ScrollView contentContainerStyle={{ flexGrow: 1, width: '100%' }} keyboardShouldPersistTaps="handled">
              <TextInput
                label="Nome da ONG"
                mode="outlined"
                value={name}
                onChangeText={setName}
                style={styles.input}
                theme={inputTheme}
                autoCapitalize="words"
              />
              <TextInput
                label="CNPJ"
                mode="outlined"
                value={cnpj} 
                onChangeText={text => setCnpj(maskCnpj(text))} 
                style={styles.input}
                theme={inputTheme}
                keyboardType="numeric"
                maxLength={18} 
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
                label="Senha"
                mode="outlined"
                value={password}
                onChangeText={setPassword}
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
              <TextInput
                label="Confirme sua Senha"
                mode="outlined"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
                theme={inputTheme}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password"
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                  />
                }
              />
              <CustomButton
                title={'Seguinte'}
                borderColor="transparent"
                textColor={Theme.BACK}
                color={Theme.PRIMARY}
                onPress={() => {
                  if (!name || !email || !phone || !cnpj || !password || !confirmPassword) { 
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

                  const unmaskedCnpj = cnpj.replace(/\D/g, ''); 
                  if (!/^\d{14}$/.test(unmaskedCnpj)) {
                    Alert.alert('Erro', 'CNPJ inválido. Certifique-se de que possui 14 dígitos.');
                    return;
                  }

                  const unmaskedPhone = phone.replace(/\D/g, '');
                  if (!/^\d{10,11}$/.test(unmaskedPhone)) {
                    Alert.alert('Erro', 'Telefone inválido. Certifique-se de que possui 10 ou 11 dígitos (incluindo DDD).');
                    return;
                  }

                  navigation.navigate('Address', {
                    name,
                    email,
                    telephone: phone, 
                    cpf: cnpj,
                    password,
                    fromOng: true,
                  });
                }}
                disabled={false}
                buttonStyle={{ marginBottom: '5%', marginTop: '5%', width: width * 0.85, alignSelf: 'center' }}
              />
            </ScrollView>
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
    width: '100%',
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
    fontFamily: 'Poppins-SemiBold',
    marginTop: 20,
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
    width: width * 0.85,
    backgroundColor: '#fff',
    alignSelf: 'center',
    borderRadius: 10,
  },
});