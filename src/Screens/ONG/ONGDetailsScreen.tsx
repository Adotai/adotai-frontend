import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../../constants/Themes';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import CustomButton from '../../Components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { uploadFileToStorage } from '../../services/uploadFileToStorage';
import { CustomInput } from '../../Components/CustomInput';
import { handleSignUpOng } from '../../actions/userActions'; // IMPORTANTE: importar aqui

function FileUploadInput({ label, file, setFile }: { label: string, file: any, setFile: (file: any) => void }) {
  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.assets && result.assets.length > 0) {
      setFile(result.assets[0]);
    }
  };
  return (
    <View style={{ width: 350, marginBottom: 15 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.uploadBox} onPress={handlePickFile}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {file?.name ? (
            <>
              <Ionicons name="document-attach-outline" size={22} color={Theme.PRIMARY} style={{ marginRight: 8 }} />
              <Text style={styles.uploadText} numberOfLines={1}>{file.name}</Text>
            </>
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={24} color="#888" style={{ marginRight: 8 }} />
              <Text style={styles.uploadText}>Selecionar arquivo</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

function ImageUploadInput({ label, images, setImages }: { label: string, images: any[], setImages: (imgs: any[]) => void }) {
  const handlePickImage = async () => {
    if (images.length >= 3) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 3 - images.length,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImages = [...images, ...result.assets].slice(0, 3);
      setImages(newImages);
    }
  };
  const handleRemove = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.uploadContainer} onPress={handlePickImage} disabled={images.length >= 3}>
        <View style={[styles.uploadBox, { height: 200, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }]}>
          {images.length === 0 ? (
            <Text style={styles.uploadText}>Selecionar fotos</Text>
          ) : (
            images.map((img, idx) => (
              <View key={idx} style={{ margin: 8, alignItems: 'center' }}>
                <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                <TouchableOpacity onPress={() => handleRemove(idx)}>
                  <Ionicons name="close-circle" size={20} color="#d33" />
                </TouchableOpacity>
              </View>
            ))
          )}
          {images.length < 3 && (
            <Ionicons name="add-circle-outline" size={32} color="#888" style={{ marginLeft: 8 }} />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

// --- TELA PRINCIPAL ---
const animalTypes = ['Cães', 'Gatos', 'Cães e Gatos', 'Outros'];

export default function ONGDetailsScreen({ route, navigation }: any) {
  const { name, email, telephone, cnpj, password, address } = route.params || {};
    // TODO: Antes de permitir o cadastro e upload dos arquivos,
  // faça uma validação para checar se já existe uma ONG com esses dados (ex: CNPJ ou email).
  // Só permita o cadastro e upload se não existir.
  // Exemplo:
  // const exists = await checkOngExists(cnpj, email);
  // if (exists) {
  //   Alert.alert('Erro', 'Já existe uma ONG cadastrada com esse CNPJ ou email.');
  //   return;
  // }

  const [animalType, setAnimalType] = useState('');
  const [pix, setPix] = useState('');
  const [ataFile, setAtaFile] = useState<any>(null);
  const [estatutoFile, setEstatutoFile] = useState<any>(null);
  const [localImages, setLocalImages] = useState<any[]>([]);

  const handleSubmit = async () => {
    try {
      let ataUrl = '';
      let estatutoUrl = '';
      let imageUrls: string[] = [];

      // Use o CNPJ como pasta principal
      const ongId = cnpj.replace(/\D/g, ''); // remove caracteres não numéricos

      if (ataFile?.uri) {
        ataUrl = await uploadFileToStorage(
          ataFile.uri,
          `ongs/${ongId}/atas/${Date.now()}_${ataFile.name}`
        );
      }
      if (estatutoFile?.uri) {
        estatutoUrl = await uploadFileToStorage(
          estatutoFile.uri,
          `ongs/${ongId}/estatutos/${Date.now()}_${estatutoFile.name}`
        );
      }
      for (let i = 0; i < localImages.length; i++) {
        const img = localImages[i];
        if (img?.uri) {
          const url = await uploadFileToStorage(
            img.uri,
            `ongs/${ongId}/fotos/${Date.now()}_${i}.jpg`
          );
          imageUrls.push(url);
        }
      }

      const photos = imageUrls.map((url) => ({ photoUrl: url }));

      const success = await handleSignUpOng(
        name,
        email,
        telephone,
        cnpj,
        password,
        pix,
        {
          socialStatute: estatutoUrl,
          boardMeeting: ataUrl,
        },
        photos,
        address
      );

      if (success) {
        Alert.alert('Sucesso', 'ONG cadastrada com sucesso!');
        navigation.navigate('ONGHome');
      }
    } catch (err) {
      Alert.alert('Erro', 'Falha ao cadastrar ONG.');
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Image style={styles.backgroundImage} source={require('../../../assets/images/background-home.png')} />
      <View style={styles.overlay}>
        <View style={styles.formContainer}>
          <Text style={styles.loginText}>Detalhes da ONG</Text>
          <ScrollView contentContainerStyle={{ flexGrow: 1, width: '100%' }} keyboardShouldPersistTaps="handled">

            <CustomInput label="Chave PIX" value={pix} onChange={setPix} />

            <Text style={styles.label}>Tipo de animais</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={animalType}
                onValueChange={setAnimalType}
                style={styles.picker}
              >
                <Picker.Item label="Selecione o tipo de animais" value="" />
                {animalTypes.map((type) => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>

            <FileUploadInput label="Ata da Assembleia da Atual Diretoria" file={ataFile} setFile={setAtaFile} />
            <FileUploadInput label="Estatuto Social" file={estatutoFile} setFile={setEstatutoFile} />
            <ImageUploadInput label="Fotos do Local (até 3 fotos)" images={localImages} setImages={setLocalImages} />

            <CustomButton
              title={'CADASTRAR'}
              borderColor="transparent"
              textColor={Theme.BACK}
              color={Theme.TERTIARY}
              onPress={handleSubmit}
              disabled={false}
              buttonStyle={{ marginBottom: '5%', marginTop: '5%' }}
            />
          </ScrollView>
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
    alignSelf: 'flex-start',
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: Theme.INPUT,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: 'white',
    width: 350,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  uploadContainer: {
    width: 350,
    marginBottom: 15,
  },
  uploadBox: {
    height: 50,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: Theme.INPUT,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    color: '#888',
    fontSize: 16,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 4,
  },
});
