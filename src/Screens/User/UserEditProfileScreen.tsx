import { StyleSheet, Text, View, Image, Dimensions, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Theme } from '../../../constants/Themes';
import { TextInput } from 'react-native-paper';
import CustomButton from '../../Components/CustomButton';
import { StatusBar } from 'expo-status-bar';
import { NavigationProp, useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { deleteUserPhotos, updateUser } from '../../actions/userActions';
import { fetchLoggedUser } from '../../actions/userActions';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { uploadFileToStorage } from '../../services/uploadFileToStorage'; // Importe a função de upload
import { Picker } from '@react-native-picker/picker';

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

function maskDate(value: string) {
  return value
    .replace(/\D/g, '') // Remove não-números
    .replace(/(\d{2})(\d)/, '$1/$2') // Adiciona a primeira barra
    .replace(/(\d{2})(\d)/, '$1/$2') // Adiciona a segunda barra
    .slice(0, 10); // Limita a 10 caracteres
}

// Converte DD/MM/AAAA para Date (para salvar no estado original se precisar)
// Ou converte direto para YYYY-MM-DD para o backend
function convertToBackendDate(dateString: string): string | null {
  if (dateString.length !== 10) return null;
  const parts = dateString.split('/');
  // Espera DD/MM/AAAA e transforma em AAAA-MM-DD
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// Formata uma data vinda do backend (AAAA-MM-DD ou objeto Date) para DD/MM/AAAA para exibir no input
function formatDateToDisplay(date: string | Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  // Ajusta o fuso horário se necessário, mas para data de nascimento simples:
  return d.toLocaleDateString('pt-BR');
}

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
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [birthDateText, setBirthDateText] = useState('');
  const [gender, setGender] = useState('');
  const [houseType, setHouseType] = useState('');
  const [houseSize, setHouseSize] = useState('');
  const [animalsQuantity, setAnimalsQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await fetchLoggedUser();
      if (userData) {
        setUserId(typeof userData.id === 'number' ? userData.id : null);
        setUserAddressId(userData.address?.id || null);
        setUserAddress(userData.address || {});
        setUserName(userData.name || '');
        setEmail(userData.email || '');
        setPhone(maskPhone(userData.phone || ''));
        setCpf(maskCpf(userData.cpf || ''));
        setUserCity(userData.address?.city || '');
        setUserState(userData.address?.state || '');

        // Novos campos (assumindo que fetchLoggedUser retorna tudo)
        if (userData.birthDate) {
          // Se vier como string AAAA-MM-DD do backend, precisamos ajustar
          // O jeito mais seguro se vier '2025-11-09' é fazer split direto para não ter problema de fuso
          const parts = new Date(userData.birthDate).toISOString().split('T')[0].split('-');
          if (parts.length === 3) {
            setBirthDateText(`${parts[2]}/${parts[1]}/${parts[0]}`);
          } else {
            // Fallback
            setBirthDateText(new Date(userData.birthDate).toLocaleDateString('pt-BR'));
          }
        } setGender(userData.gender || '');
        setHouseType(userData.houseType || '');
        setHouseSize(userData.houseSize || '');
        setAnimalsQuantity(userData.animalsQuantity || '');
        setDescription(userData.description || '');
        setImages(userData.photos || []);
      }
    };
    loadUser();
  }, []);


  const handleSave = async () => {
    if (!userId) {
      Alert.alert('Erro', 'Usuário não identificado.');
      return;
    }
    setLoading(true);
    try {
      // 1. Upload das novas imagens
      const uploadedPhotos = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        // Se tem 'uri' e 'isNew', precisa fazer upload
        if (img.uri && img.isNew) {
          const url = await uploadFileToStorage(
            img.uri,
            `users/${userId}/profile/${Date.now()}_${i}.jpg`
          );
          uploadedPhotos.push({ photoUrl: url });
        } else {
          // Se já era uma foto existente (tem photoUrl ou id), mantém
          // Ajuste conforme o formato que seu backend espera para MANTER fotos
          uploadedPhotos.push(img);
        }
      }

      const addressToSend = {
        ...userAddress,
        city: userCity,
        state: userState,
      };

      const payload = {
        id: userId,
        name: userName,
        email: userEmail,
        cpf: unmaskCpf(userCpf),
        telephone: unmaskPhone(userPhone),
        address: addressToSend,
        addressId: userAddressId !== null ? userAddressId : 0,
        gender,
        houseType,
        houseSize,
        animalsQuantity,
        description,
        photos: uploadedPhotos 
      };

      console.log("PAYLOAD SENDO ENVIADO:", JSON.stringify(payload, null, 2));

      // Chama a atualização usando a variável payload
      await updateUser(payload);

      Alert.alert('Sucesso', 'Perfil atualizado!');
      navigation.goBack();

    } catch (err: any) {
      // ▼▼▼ 3. LOG PARA VER A RESPOSTA EXATA DO BACKEND (O MOTIVO DO 400) ▼▼▼
      console.error("ERRO DETALHADO DO BACKEND:", err.response?.data);

      Alert.alert('Erro', err.response?.data?.message || 'Não foi possível atualizar os dados.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    if (images.length >= 3) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 3 - images.length,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImages = [...images, ...result.assets.map((a: any) => ({ photoUrl: a.uri }))].slice(0, 3);
      setImages(newImages);
    }
  };


  const handleRemove = async (idx: number) => {
    const photoToDelete = images[idx];
    
    // Se a foto já existe no backend (tem ID), deleta de lá
    if (photoToDelete.id && userId) {
        try {
            await deleteUserPhotos(userId, [photoToDelete.id]);
             // Só remove do estado se o backend confirmar (ou remove otimista e volta se der erro)
            setImages(images.filter((_, i) => i !== idx));
        } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir a foto.");
        }
    } else {
        // Se é uma foto nova (ainda não salva), só remove do estado local
        setImages(images.filter((_, i) => i !== idx));
    }
  };

  return (
    <SafeAreaView style={styles.overlay} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingVertical: 20 }} keyboardShouldPersistTaps="handled">

        {/* <ImageUploadInput images={images} setImages={setImages} /> */}
        <View style={{ flexDirection: 'row', marginBottom: 16, justifyContent: 'center', alignItems: 'center' }}>
          {images.map((img, idx) => (
            <View key={idx} style={{ margin: 4, alignItems: 'center' }}>
              <Image source={{ uri: img.photoUrl }} style={{ width: width * 0.25, height: height * 0.20, borderRadius: 8 }} />
              <TouchableOpacity onPress={() => handleRemove(idx)}>
                <Text style={{ color: '#d33', fontSize: 12 }}>Remover</Text>
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 3 && (
            <TouchableOpacity onPress={handlePickImage} style={styles.addPhotoBtn}>
              <Text style={{ fontSize: 32, color: '#888' }}>+</Text>
            </TouchableOpacity>
          )}
        </View>

        <TextInput label="Nome" mode="outlined" value={userName} onChangeText={setUserName} style={styles.input} theme={inputTheme} />
        <TextInput label="E-mail" mode="outlined" value={userEmail} onChangeText={setEmail} style={styles.input} theme={inputTheme} keyboardType="email-address" />
        <TextInput label="Telefone" mode="outlined" value={userPhone} onChangeText={text => setPhone(maskPhone(text))} style={styles.input} theme={inputTheme} keyboardType="phone-pad" maxLength={15} />
        <TextInput label="CPF" mode="outlined" value={userCpf} onChangeText={text => setCpf(maskCpf(text))} style={styles.input} theme={inputTheme} keyboardType="numeric" maxLength={14} />

       
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

        <TextInput label="Possui Animais? Quantos?" mode="outlined" value={animalsQuantity} onChangeText={setAnimalsQuantity} style={styles.input} theme={inputTheme} keyboardType="numeric" />

        <TextInput label="Sobre Mim (Descrição)" mode="outlined" value={description} onChangeText={setDescription} style={[styles.input, { height: 100 }]} multiline theme={inputTheme} />

        {/* Endereço */}
        <Text style={styles.sectionTitle}>Endereço</Text>
        <TextInput label="CEP" mode="outlined" value={userAddress?.zipCode || ''} onChangeText={text => setUserAddress((prev: any) => ({ ...prev, zipCode: maskCep(text) }))} style={styles.input} theme={inputTheme} keyboardType="numeric" maxLength={9} />
        <TextInput label="Rua" mode="outlined" value={userAddress?.street || ''} onChangeText={text => setUserAddress((prev: any) => ({ ...prev, street: text }))} style={styles.input} theme={inputTheme} />
        <TextInput label="Número" mode="outlined" value={userAddress?.number ? String(userAddress.number) : ''} onChangeText={text => setUserAddress((prev: any) => ({ ...prev, number: text.replace(/\D/g, '') }))} style={styles.input} theme={inputTheme} keyboardType="numeric" />
        <TextInput label="Cidade" mode="outlined" value={userCity} onChangeText={setUserCity} style={styles.input} theme={inputTheme} />
        <TextInput label="Estado" mode="outlined" value={userState} onChangeText={setUserState} style={styles.input} theme={inputTheme} maxLength={2} />

      </ScrollView>

      <CustomButton
        title={loading ? 'Salvando...' : 'Salvar Alterações'}
        borderColor="transparent"
        textColor={Theme.BACK}
        color={Theme.PRIMARY}
        onPress={handleSave}
        disabled={loading}
        buttonStyle={{ marginBottom: 10, width: width * .85, alignSelf: 'center' }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Theme.BACK,
  },
  input: {
    marginBottom: 12,
    width: width * .85,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  addPhotoBtn: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center'
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
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width * 0.85,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12
  },
  datePickerText: {
    fontSize: 16,
    color: '#222'
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
  // Estilos para o ImageUploadInput
  label: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Theme.TERTIARY,
    marginBottom: 8
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    minHeight: 100
  },
  imageContainer: {
    margin: 8,
    position: 'relative'
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 10
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 12
  }
});