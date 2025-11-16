import { StyleSheet, Text, View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import { Theme } from '../../../constants/Themes';
import { TextInput } from 'react-native-paper';
import CustomButton from '../../Components/CustomButton';
import { NavigationProp, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { Picker } from '@react-native-picker/picker';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

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
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
}

export default function UserExtraScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'UserExtra'>>();
  const { name, email, telephone, cpf, password, fromOng } = route.params;

  const [gender, setGender] = useState('');
  const [houseType, setHouseType] = useState('');
  const [houseSize, setHouseSize] = useState('');
  const [animalsQuantity, setAnimalsQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [photos, setPhotos] = useState<string[]>([]); // Array para armazenar URLs ou caminhos das fotos


  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.formContainer}>
          <Text style={styles.loginText}>Informações adicionais</Text>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
              {/* Gênero */}
              <View style={styles.pickerWrapper}>
                <Picker selectedValue={gender} onValueChange={setGender} style={styles.picker}>
                  <Picker.Item label="Selecione o Gênero" value="" color="#999" />
                  <Picker.Item label="Masculino" value="male" />
                  <Picker.Item label="Feminino" value="female" />
                </Picker>
              </View>

              {/* Tipo de Moradia */}
              <View style={styles.pickerWrapper}>
                <Picker selectedValue={houseType} onValueChange={setHouseType} style={styles.picker}>
                  <Picker.Item label="Tipo de Moradia" value="" color="#999" />
                  <Picker.Item label="Casa" value="house" />
                  <Picker.Item label="Apartamento" value="apartment" />
                  <Picker.Item label="Sítio/Chácara" value="farm" />
                </Picker>
              </View>

              {/* Tamanho da Moradia */}
              <View style={styles.pickerWrapper}>
                <Picker selectedValue={houseSize} onValueChange={setHouseSize} style={styles.picker}>
                  <Picker.Item label="Tamanho da Moradia" value="" color="#999" />
                  <Picker.Item label="Pequeno" value="small" />
                  <Picker.Item label="Médio" value="medium" />
                  <Picker.Item label="Grande" value="large" />
                </Picker>
              </View>

              <TextInput
                label="Possui Animais? Quantos?"
                mode="outlined"
                value={animalsQuantity}
                onChangeText={setAnimalsQuantity}
                style={styles.input}
                theme={inputTheme}
                keyboardType="numeric"
              />

              <TextInput
                label="Sobre Mim (Descrição)"
                mode="outlined"
                value={description}
                onChangeText={setDescription}
                style={[styles.input, { height: 100 }]}
                multiline
                theme={inputTheme}
              />


            </ScrollView>

            <CustomButton
              title={'Seguinte'}
              borderColor="transparent"
              textColor={Theme.BACK}
              color={Theme.PRIMARY}
              onPress={() => {
                // Validação simples
                if (!gender || !houseType || !houseSize || !animalsQuantity || !description) {
                  Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
                  return;
                }
                // Navega para AddressScreen passando todos os dados
                navigation.navigate('Address', {
                  name,
                  email,
                  telephone,
                  cpf,
                  password,
                  fromOng,
                  gender,
                  houseType,
                  houseSize,
                  animalsQuantity,
                  description,
                  photos
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
    backgroundColor: Theme.BACK,
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: Theme.TERTIARY,
    alignSelf: 'flex-start',
    marginLeft: width * 0.075,
    marginTop: 16,
    marginBottom: 8
  },
  pickerWrapper: {
    width: width * 0.85,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
    overflow: 'hidden'
  },
  picker: {
    width: '100%',
    height: 55
  },
});