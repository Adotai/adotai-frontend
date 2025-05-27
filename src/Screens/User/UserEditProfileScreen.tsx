import { StyleSheet, Text, View, Image, Dimensions, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import React from 'react';
import { Theme } from '../../../constants/Themes';
import { TextInput } from 'react-native-paper';
import CustomButton from '../../Components/CustomButton';
import { StatusBar } from 'expo-status-bar';
import { NavigationProp, useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { updateUser } from '../../actions/userActions';
import { fetchLoggedUser } from '../../actions/userActions';
import { SafeAreaView } from 'react-native-safe-area-context';

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
function unmaskCpf(value: string) {
  return value.replace(/\D/g, '');
}
function unmaskPhone(value: string) {
  return value.replace(/\D/g, '');
}

function maskCep(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
}

export default function UserEditProfileScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'UserEditProfile'>>();
  const { name, city, state, cpf, phone, email } = route.params;

  const [userName, setUserName] = React.useState(name || '');
  const [userCity, setUserCity] = React.useState(city || '');
  const [userState, setUserState] = React.useState(state || '');
  const [userEmail, setEmail] = React.useState(email || '');
  const [userPhone, setPhone] = React.useState(phone || '');
  const [userCpf, setCpf] = React.useState(cpf || '');
  const [userId, setUserId] = React.useState<number | null>(null);
  const [userAddressId, setUserAddressId] = React.useState<number | null>(null);
  const [userAddress, setUserAddress] = React.useState<any>(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await fetchLoggedUser();
      if (userData) {
        setUserId(typeof userData.id === 'number' ? userData.id : null);
        setUserAddressId(userData.address?.id || null);
        setUserAddress(userData.address || null);
        setUserName(userData.name || '');
        setEmail(userData.email || '');
        setPhone(userData.phone || '');
        setCpf(userData.cpf || '');
        setUserCity(userData.city || '');
        setUserState(userData.state || '');
      }
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    if (!userId) {
      Alert.alert('Erro', 'Usuário não identificado.');
      return;
    }
    try {
      const addressToSend = {
        ...userAddress,
        city: userCity,
        state: userState,
      };
      await updateUser({
        id: userId,
        name: userName,
        email: userEmail,
        cpf: unmaskCpf(userCpf),
        password: '', // vazio se não for trocar
        telephone: unmaskPhone(userPhone),
        address: addressToSend,
        addressId: userAddressId !== null ? userAddressId : 0,
      });
      Alert.alert('Sucesso', 'Dados atualizados!');
      navigation.goBack();
    } catch (err: any) {
      if (err.response?.data?.message) {
        Alert.alert('Erro', err.response.data.message);
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar os dados.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.overlay}>
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
         <TextInput
  label="CEP"
  mode="outlined"
  value={userAddress?.zipCode || ''}
  onChangeText={text =>
    setUserAddress((prev: any) => ({
      ...prev,
      zipCode: maskCep(text)
    }))
  }
  style={styles.input}
  theme={inputTheme}
  keyboardType="numeric"
  maxLength={9}
/>
          <TextInput
            label="Endereço"
            mode="outlined"

            value={userAddress?.street || ''}
            onChangeText={text => setUserAddress((prev: any) => ({ ...prev, street: text }))}
            style={styles.input}
            theme={inputTheme}
          />
          <TextInput
            label="Número"
            mode="outlined"

            value={userAddress?.number ? String(userAddress.number) : ''}
            onChangeText={text => setUserAddress((prev: any) => ({ ...prev, number: text.replace(/\D/g, '') }))}
            style={styles.input}
            theme={inputTheme}
            keyboardType="numeric"
          />
          <TextInput
            label="Cidade"
            mode="outlined"

            value={userCity}
            onChangeText={setUserCity}
            style={styles.input}
            theme={inputTheme}
          />
          <TextInput
            label="Estado"
            mode="outlined"

            value={userState}
            onChangeText={setUserState}
            style={styles.input}
            theme={inputTheme}
          />
        </ScrollView>

        <CustomButton
          title={'Salvar'}
          borderColor="transparent"
          textColor={Theme.BACK}
          color={Theme.PRIMARY}
          onPress={handleSave}
          disabled={false}
          buttonStyle={{ marginBottom: '5%', marginTop: '5%', width: width * .85, alignSelf: 'center' }}
        />
    </SafeAreaView>
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
     alignItems: 'center', width: '100%', backgroundColor: '#fff', height: '100%' 
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
    fontFamily: 'Poppins-SemiBold',
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
