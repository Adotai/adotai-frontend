import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../../constants/Themes';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import CustomButton from '../../Components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { uploadFileToStorage } from '../../services/uploadFileToStorage';
import { TextInput } from 'react-native-paper'; 
import { handleSignUpOng } from '../../actions/ongActions';
import { ActivityIndicator } from 'react-native';


const { width, height } = Dimensions.get('window');

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
    <View style={{ width: width * 0.85, marginBottom: 15 }}>
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
        <View style={[styles.uploadBox, { height: height * 0.15, flexDirection: 'row', alignContent: 'center', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }]}>
          {images.length === 0 ? (
            <Text style={styles.uploadText}>Selecionar fotos</Text>
          ) : (
            images.map((img, idx) => (
              <View key={idx} style={{ margin: 8, alignItems: 'center', }}>
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

const animalTypes = ['Cães', 'Gatos', 'Cães e Gatos'];

export default function ONGDetailsScreen({ route, navigation }: any) {
  const { name, email, telephone, cnpj, password, address } = route.params || {};

  const [animalType, setAnimalType] = useState('');
  const [pix, setPix] = useState('');
  const [description, setDescription] = useState('');
  const [ataFile, setAtaFile] = useState<any>(null);
  const [estatutoFile, setEstatutoFile] = useState<any>(null);
  const [localImages, setLocalImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);


  const handleSubmit = async () => {

    if (!pix || !description || !animalType) {
    Alert.alert('Erro', 'Preencha todos os campos obrigatórios!');
    return;
  }
  if (!ataFile) {
    Alert.alert('Erro', 'Envie a Ata da Assembleia da Atual Diretoria!');
    return;
  }
  if (!estatutoFile) {
    Alert.alert('Erro', 'Envie o Estatuto Social!');
    return;
  }
  if (localImages.length === 0) {
    Alert.alert('Erro', 'Envie pelo menos uma foto do local!');
    return;
  }
    setLoading(true); 
    try {
      let ataUrl = '';
      let estatutoUrl = '';
      let imageUrls: string[] = [];

      const ongId = cnpj.replace(/\D/g, ''); 

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
        address,
        description,
        animalType 
      );

      if (success) {
        Alert.alert('Validação Necessária', 'ONG cadastrada com sucesso e enviada para validação do administrador.');
        navigation.navigate('Onboarding');
      }
    } catch (err) {
      Alert.alert('Erro', 'Falha ao cadastrar ONG.');
      console.error(err);
    } finally{
       setLoading(false); 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image style={styles.backgroundImage} source={require('../../../assets/images/background-home.png')} />
       {loading && (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color={Theme.PRIMARY} />
        <Text style={{ color: Theme.PRIMARY, fontFamily: 'Poppins-SemiBold', marginTop: 10 }}>Carregando...</Text>
      </View>
    )}
      <View style={styles.formCard}>
        <Text style={styles.loginText}>Detalhes da ONG</Text>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TextInput
              label="Chave PIX"
              mode="outlined"
              value={pix}
              onChangeText={setPix}
              style={styles.input}
              theme={inputTheme}
              autoCapitalize="none"
            />
            <TextInput
              label="Descrição"
              mode="outlined"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              theme={inputTheme}
              autoCapitalize="none"
            />

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
              title={'Cadastrar'}
              borderColor="transparent"
              textColor={Theme.BACK}
              color={Theme.PRIMARY}
              onPress={handleSubmit}
              disabled={loading}
              buttonStyle={{ width: width * 0.85 }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: height,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  formCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
    position: 'absolute',
    width: '100%',
    bottom: 0
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
    fontFamily: 'Poppins-Regular',
    alignSelf: 'flex-start',
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: Theme.INPUT,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: 'white',
    width: width * 0.85,
  },
  picker: {
    width: '100%',
  },
  uploadContainer: {
    width: width * 0.85,
    marginBottom: 15,
  },
  uploadBox: {
    height: 50,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: Theme.INPUT,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
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
  input: {
    marginBottom: 12,
    width: width * 0.85,
    alignSelf: 'center',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  loadingOverlay: {
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(255,255,255,0.7)',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
},
});
