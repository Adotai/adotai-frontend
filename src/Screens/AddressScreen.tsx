import { StyleSheet, Text, View, Image, ScrollView, Alert } from 'react-native';
import React from 'react';
import { Picker } from '@react-native-picker/picker';
import CustomButton from '../Components/CustomButton';
import { Theme } from '../../constants/Themes';
import { CustomInput } from '../Components/CustomInput';
import { handleSignUp } from '../actions/userActions';

export default function AddressScreen({ route, navigation }: any) {
  const { name, email, telephone, cpf, password } = route.params || {};

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

  //const houseTypes = ['Casa', 'Apartamento', 'Comercial'];


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

  return (
    <View style={styles.container}>
      <Image style={styles.backgroundImage} source={require('../../assets/images/background-home.png')} />

      <View style={styles.overlay}>
        <View style={styles.formContainer}>
          <Text style={styles.loginText}>Detalhes de Endereço</Text>
          <ScrollView contentContainerStyle={{ flexGrow: 1, width: '100%' }} keyboardShouldPersistTaps="handled">
            <CustomInput label="CEP" value={cep} onChange={setCep} />

            <Text style={styles.label}>Estado</Text>
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

            <CustomInput label="Cidade" value={city} onChange={setCity} />
            <CustomInput label="Endereço" value={address} onChange={setAddress} />
            <CustomInput label="Número" value={number} onChange={setNumber} />
            {/* <Text style={styles.label}>Tipo de imóvel</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={houseType}
                onValueChange={(itemValue) => setHouseType(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Selecione o tipo de imóvel" value="" />
                {houseTypes.map((type) => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View> */}
          </ScrollView>

          <CustomButton
            title={'CADASTRAR'}
            borderColor="transparent"
            textColor={Theme.BACK}
            color={Theme.TERTIARY}
            onPress={handleRegister}
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
    bottom: 0,
  },
  loginText: {
    fontSize: 24,
    color: Theme.PRIMARY,
    fontFamily: 'Poppins-Bold',
    marginTop: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: Theme.PRIMARY,
    fontFamily: 'Poppins-Bold',
      },
  pickerContainer: {
    borderWidth: 2,
    borderColor: Theme.INPUT,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
    width: '100%',
  },
});
