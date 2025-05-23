import { StyleSheet, Text, View, Image, ScrollView, Alert, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import React from 'react';
import { Picker } from '@react-native-picker/picker';
import CustomButton from '../Components/CustomButton';
import { Theme } from '../../constants/Themes';
import { TextInput } from 'react-native-paper'; // Troque CustomInput por TextInput do paper
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

export default function AddressScreen({ route, navigation }: any) {
  const { name, email, telephone, cpf, password, fromOng } = route.params || {};

  if (!name || !email || !telephone || !cpf || !password) {
    Alert.alert('Error', 'Missing user information. Please go back and fill in all fields.');
    return null;
  }

  const [cep, setCep] = React.useState('');
  const [state, setState] = React.useState('');
  const [city, setCity] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [number, setNumber] = React.useState('');
  const [houseType, setHouseType] = React.useState('');

  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ',
    'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const handleRegister = async () => {
    if (!cep || !state || !city || !address || !number) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const success = await handleSignUp(name, email, telephone, cpf, password, {
      street: address,
      number: parseInt(number, 10),
      city,
      state,
      zipCode: cep,
    });

    if (success) {
      navigation.navigate('UserHome');
    } else {
      Alert.alert('Error', 'Failed to register user.');
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
        zipCode: cep,
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
                onChangeText={setCep}
                style={styles.input}
                theme={inputTheme}
                keyboardType="numeric"
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
                onChangeText={setNumber}
                style={styles.input}
                theme={inputTheme}
                keyboardType="numeric"
              />
              <CustomButton
                title={fromOng ? 'Seguinte' : 'Cadastrar'}
                borderColor="transparent"
                textColor={Theme.BACK}
                color={Theme.PRIMARY}
                onPress={fromOng ? handleOngNext : handleRegister}
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
    fontFamily: 'Poppins-Bold',
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
