import { StyleSheet, Text, View, Image, Dimensions, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import React from 'react';
import { Theme } from '../../../constants/Themes';
import { TextInput } from 'react-native-paper';
import CustomButton from '../../Components/CustomButton';
import { StatusBar } from 'expo-status-bar';
import { NavigationProp, useNavigation, RouteProp, useRoute } from '@react-navigation/native';
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

export default function UserEditProfileScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'UserEditProfile'>>();
  const { name, city, state, cpf, phone, email} = route.params;

  const [userName, setUserName] = React.useState(name || '');
  const [userCity, setUserCity] = React.useState(city || '');
  const [userState, setUserState] = React.useState(state || '');
  const [userEmail, setEmail] = React.useState(email || '');
  const [userPhone, setPhone] = React.useState(phone || '');
  const [userCpf, setCpf] = React.useState(cpf || '');


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
              value={userName}
              onChangeText={setUserName}
              style={styles.input}
              theme={inputTheme}
              autoCapitalize="words"
            />
            <TextInput
              label="E-mail"
              mode="outlined"
              value={userEmail}
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
              value={userPhone}
              onChangeText={text => setPhone(maskPhone(text))}
              style={styles.input}
              theme={inputTheme}
              keyboardType="phone-pad"
              autoComplete="tel"
              maxLength={15} // Limita o tamanho máximo do telefone
            />
            <TextInput
              label="CPF"
              mode="outlined"
              value={userCpf}
              onChangeText={text => setCpf(maskCpf(text))}
              style={styles.input}
              theme={inputTheme}
              keyboardType="numeric"
              maxLength={14} // Limita o tamanho máximo do CPF
            />
           
          </ScrollView>

          <CustomButton
            title={'Salvar'}
            borderColor="transparent"
            textColor={Theme.BACK}
            color={Theme.PRIMARY}
            onPress={() => {
              if (!userName || !email || !phone || !cpf) {
                Alert.alert('Erro', 'Todos os campos são obrigatórios.');
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
                name: userName,
                email,
                telephone: phone,
                cpf,
                fromOng: false,
                password: '', });
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
