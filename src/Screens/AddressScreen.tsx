import { StyleSheet, Text, View, Image, ScrollView, Alert, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import React from 'react';
import { Picker } from '@react-native-picker/picker';
import CustomButton from '../Components/CustomButton';
import { Theme } from '../../constants/Themes';
import { TextInput } from 'react-native-paper';
import { handleSignUp } from '../actions/userActions';


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

function maskCep(value: string) {
  return value
    .replace(/\D/g, '') // Remove tudo que não é dígito
    .replace(/^(\d{5})(\d)/, '$1-$2') // Coloca o hífen depois do 5º dígito
    .slice(0, 9); // Limita a 9 caracteres (XXXXX-XXX)
}

export default function AddressScreen({ route, navigation }: any) {
  const { name, email, telephone, cpf, password, fromOng, gender, houseType, houseSize, animalsQuantity, description, photos } = route.params || {};

  if (!name || !email || !telephone || !cpf || !password) {
    Alert.alert('Erro', 'Informações de usuário ausentes. Por favor, volte e preencha todos os campos.');
    return null;
  }

  const [cep, setCep] = React.useState('');
  const [state, setState] = React.useState('');
  const [city, setCity] = React.useState('');
  const [address, setAddress] = React.useState(''); 
  const [number, setNumber] = React.useState('');
  const [houseTypeState, setHouseType] = React.useState(''); 

  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ',
    'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const validateAndProceed = () => {
    if (!cep || !state || !city || !address || !number) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const unmaskedCep = cep.replace(/\D/g, '');
    if (!/^\d{8}$/.test(unmaskedCep)) {
      Alert.alert('Erro', 'CEP inválido. Certifique-se de que possui 8 dígitos.');
      return;
    }

    if (!/^\d+$/.test(number) || parseInt(number, 10) <= 0) {
        Alert.alert('Erro', 'Número inválido. Por favor, insira um número positivo.');
        return;
    }


    if (fromOng) {
      handleOngNext();
    } else {
      handleRegister();
    }
  };


  const handleRegister = async () => {
    const success = await handleSignUp(name, email, telephone, cpf, password, {
      street: address, 
      number: parseInt(number, 10),
      city,
      state,
      zipCode: cep.replace(/\D/g, ''),
    }, {
      gender,
      houseType,
      houseSize,
      animalsQuantity,
      description,
      photos
    });

    if (success) {
      navigation.navigate('Onboarding');
    } else {
      Alert.alert('Erro', 'Falha ao cadastrar usuário.');
    }
  };

  const handleOngNext = () => {
    navigation.navigate('ONGDetails', {
      name,
      email,
      telephone,
      cnpj: cpf, 
      password,
      pix: '',
      address: {
        street: address,
        number: parseInt(number, 10),
        city,
        state,
        zipCode: cep.replace(/\D/g, ''), 
      },
    });
  };

  return (
    <View style={styles.container}>
      <Image style={styles.backgroundImage} source={require('../../assets/images/background-home.png')} />

      <View style={styles.overlay}>
        <View style={styles.formContainer}>
          <Text style={styles.loginText}>Detalhes de Endereço</Text>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
              <TextInput
                label="CEP"
                mode="outlined"
                value={cep}
                onChangeText={text => setCep(maskCep(text))} 
                style={styles.input}
                theme={inputTheme}
                keyboardType="numeric" // Garante teclado numérico
                maxLength={9} // Limita a 9 caracteres (XXXXX-XXX)
              />

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={state}
                  onValueChange={(itemValue) => setState(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione um estado" value="" />
                  {states.map((state) => (
                    <Picker.Item key={state} label={state} value={state} />
                  ))}
                </Picker>
              </View>

              <TextInput
                label="Cidade"
                mode="outlined"
                value={city}
                onChangeText={setCity}
                style={styles.input}
                theme={inputTheme}
              />
              <TextInput
                label="Endereço"
                mode="outlined"
                value={address}
                onChangeText={setAddress}
                style={styles.input}
                theme={inputTheme}
              />
              <TextInput
                label="Número"
                mode="outlined"
                value={number}
                onChangeText={text => setNumber(text.replace(/\D/g, ''))}
                style={styles.input}
                theme={inputTheme}
                keyboardType="numeric" 
              />
              {/* <TextInput
                label="Tipo de Residência (ex: Casa, Apartamento)"
                mode="outlined"
                value={houseType}
                onChangeText={setHouseType}
                style={styles.input}
                theme={inputTheme}
              /> */}
            </ScrollView>

            <CustomButton
              title={fromOng ? 'Seguinte' : 'Cadastrar'}
              borderColor="transparent"
              textColor={Theme.BACK}
              color={Theme.PRIMARY}
              onPress={validateAndProceed} 
              disabled={false}
              buttonStyle={{ marginBottom: '5%', marginTop: '5%', width: width * 0.85, alignSelf: 'center' }}
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
  label: {
    fontSize: 13,
    color: Theme.PRIMARY,
    fontFamily: 'Poppins-Bold',
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: Theme.INPUT,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: 'white',
    width: width * 0.85, 
    alignSelf: 'center',
    justifyContent: 'center', 
  },
  picker: {
    width: '100%',
  },
  input: {
    marginBottom: 12,
    width: width * 0.85,
    backgroundColor: '#fff',
    alignSelf: 'center',
    borderRadius: 10,
  },
});