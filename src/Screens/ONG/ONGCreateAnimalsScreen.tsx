import React from 'react';
import { View, StyleSheet, Alert, ScrollView, Text, TouchableOpacity, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createAnimal, } from '../../actions/ongActions';
import { getLoggedOngId } from '../../actions/userActions'
import { TextInput } from 'react-native-paper';
import CustomButton from '../../Components/CustomButton';
import { Theme } from '../../../constants/Themes';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { uploadFileToStorage } from '../../services/uploadFileToStorage';
import { ActivityIndicator } from 'react-native';

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

const DOG_BREEDS = [
  'Vira-lata', 'Pastor Alemão', 'Golden Retriever', 'Labrador Retriever', 'Poodle',
  'Shih Tzu', 'Buldogue Francês', 'Chihuahua', 'Yorkshire Terrier', 'Dachshund',
  'Border Collie', 'Outra raça'
];

const CAT_BREEDS = [
  'Vira-lata', 'Siamês', 'Persa', 'Maine Coon', 'Ragdoll', 'Sphynx',
  'Bengal', 'British Shorthair', 'Outra raça'
];

const ANIMAL_COLORS = [
  'Preto', 'Branco', 'Marrom', 'Caramelo', 'Cinza', 'Dourado',
  'Tigrado', 'Malhado', 'Tricolor', 'Outra cor'
];

function ImageUploadInput({ images, setImages }: { images: any[], setImages: (imgs: any[]) => void }) {
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
    <View style={{ marginBottom: 16 }}>
      <TouchableOpacity style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap' }} onPress={handlePickImage} disabled={images.length >= 3}>
        {images.length === 0 ? (
          <Text style={{ color: '#888' }}>Selecionar até 3 fotos</Text>
        ) : (
          images.map((img, idx) => (
            <View key={idx} style={{ margin: 8, alignItems: 'center' }}>
              <Image source={{ uri: img.uri }} style={{ width: 60, height: 60, borderRadius: 10, marginBottom: 4 }} />
              <TouchableOpacity onPress={() => handleRemove(idx)}>
                <Ionicons name="close-circle" size={20} color="#d33" />
              </TouchableOpacity>
            </View>
          ))
        )}
        {images.length < 3 && (
          <Ionicons name="add-circle-outline" size={32} color="#888" style={{ marginLeft: 8 }} />
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function ONGCreateAnimalsScreen({ navigation }: any) {
  const [name, setName] = React.useState('');
  const [breed, setBreed] = React.useState('');
  const [age, setAge] = React.useState('');
  const [color, setColor] = React.useState('');
  const [species, setSpecies] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [temperament, setTemperament] = React.useState('');
  const [health, setHealth] = React.useState('');
  const [size, setSize] = React.useState('');
  const [vaccinated, setVaccinated] = React.useState(false);
  const [neutered, setNeutered] = React.useState(false);
  const [dewormed, setDewormed] = React.useState(false);
  const [ongId, setOngId] = React.useState<number | null>(null);
  const [images, setImages] = React.useState<any[]>([]);
  const [animalImages, setAnimalImages] = React.useState<any[]>([]);
  const [animalDescription, setAnimalDescription] = React.useState('');
  const [currentBreeds, setCurrentBreeds] = React.useState(DOG_BREEDS);
  const [otherBreed, setOtherBreed] = React.useState('');
  const [currentColor, setCurrentColor] = React.useState('');
  const [colorOther, setColorOther] = React.useState('');
  const [loading, setLoading] = React.useState(false);




  React.useEffect(() => {
    if (species === 'Dog') {
      setCurrentBreeds(DOG_BREEDS);
    } else if (species === 'Cat') {
      setCurrentBreeds(CAT_BREEDS);
    }
    setBreed('');
  }, [species]);

  React.useEffect(() => {
    const fetchOngId = async () => {
      const id = await getLoggedOngId();
      if (id) setOngId(id);
    };
    fetchOngId();
  }, []);

  const handleCreate = async () => {
    const breedToSend = breed === "Outra raça" ? otherBreed : breed;
    const colorToSend = color === "Outra cor" ? colorOther : color;

    setLoading(true);
    try {
      if (!name || !breed || !age || !color || !species || !gender || !temperament || !health || !size || !animalDescription) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      if (animalImages.length === 0) {
        Alert.alert('Erro', 'Adicione pelo menos uma foto do animal.');
        return;
      }

      const parsedAge = parseInt(age, 25);
      if (isNaN(parsedAge) || parsedAge <= 0) {
        Alert.alert('Erro', 'Idade inválida. Por favor, insira um número positivo.');
        return;
      }

      if (breedToSend === '' || (breed === 'Outra' && (otherBreed.trim() === '' || otherBreed.trim() === 'Outra'))) {
        Alert.alert('Erro', 'Por favor, selecione uma raça ou especifique a raça.');
        return;
      }
      if (color === '' || (color === 'Outra' && (color.trim() === 'Outra' || color.trim() === ''))) {
        Alert.alert('Erro', 'Por favor, selecione uma cor ou especifique a cor.');
        return;
      }

      const animalId = `${name.replace(/\s/g, '_')}_${Date.now()}`;
      let imageUrls: string[] = [];

      for (let i = 0; i < animalImages.length; i++) {
        const img = animalImages[i];
        if (img?.uri) {
          const url = await uploadFileToStorage(
            img.uri,
            `animals/${animalId}/fotos/${Date.now()}_${i}.jpg`
          );
          imageUrls.push(url);
        }
      }



      const photos = imageUrls.map((url) => ({ photoUrl: url }));

      const animalObj = {
        ongId: ongId ?? 0,
        name,
        gender,
        color: { name: colorToSend },
        breed: { name: breedToSend, speciesDescription: species },
        species: { description: species },
        age: parsedAge,
        size,
        health: health,
        status: true,
        vaccinated,
        neutered,
        dewormed,
        temperament: temperament,
        photos,
        animalDescription,
        solicitationStatus: false
      };

      await createAnimal(animalObj);
      Alert.alert('Sucesso', 'Animal criado com sucesso!');
      navigation.goBack();
    } catch (e) {
      // console.log('Erro ao criar animal:', e);
      Alert.alert('Erro', 'Falha ao criar animal.');
    }
    finally {
    setLoading(false); 
  }
  };


  
  return (
    <View style={{ alignItems: 'center', width: '100%', backgroundColor: Theme.BACK , height: '100%' }}>
      {loading && (
  <View style={styles.loadingOverlay}>
    <ActivityIndicator size="large" color={Theme.PRIMARY} />
    <Text style={{ color: Theme.PRIMARY, fontFamily: 'Poppins-SemiBold', marginTop: 10 }}>Cadastrando animal...</Text>
  </View>
)}
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TextInput
          label="Nome"
          mode="outlined"
          value={name}
          onChangeText={setName}
          style={styles.input}
          theme={inputTheme}
        />
        <TextInput
          label="Descrição"
          mode="outlined"
          value={animalDescription}
          onChangeText={setAnimalDescription}
          style={styles.input}
          theme={inputTheme}
          multiline
        />

        <TextInput
          label="Idade (em anos)"
          mode="outlined"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          style={styles.input}
          theme={inputTheme}
        />

        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={species}
            onValueChange={(itemValue) => setSpecies(itemValue)}
            style={styles.picker}
            dropdownIconColor={Theme.TERTIARY}
          >
            <Picker.Item label="Selecione a espécie" value="" />
            <Picker.Item label="Cachorro" value="Dog" />
            <Picker.Item label="Gato" value="Cat" />
          </Picker>
        </View>

        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={breed}
            onValueChange={(itemValue) => setBreed(itemValue)}
            style={styles.picker}
            dropdownIconColor={Theme.TERTIARY}
          >
            <Picker.Item label="Selecione a raça" value="" />
            {currentBreeds.map((b) => (
              <Picker.Item key={b} label={b} value={b} />
            ))}
          </Picker>
        </View>

        {breed === 'Outra raça' && (<View style={styles.inputContainerWithLabel}>
          <TextInput
            label="Escreva a outra raça"
            mode="outlined"
            value={otherBreed}
            onChangeText={setOtherBreed}
            style={styles.input}
            theme={inputTheme}
          />
        </View>
        )}


        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={color}
            onValueChange={(itemValue) => setColor(itemValue)}
            style={styles.picker}
            dropdownIconColor={Theme.TERTIARY}
          >
            <Picker.Item label="Selecione a cor" value="" />
            {ANIMAL_COLORS.map((c) => (
              <Picker.Item key={c} label={c} value={c} />
            ))}
          </Picker>
        </View>

        {color === 'Outra cor' && (
          <View style={styles.inputContainerWithLabel}>
            <TextInput
              label="Escreva a outra cor"
              mode="outlined"
              value={colorOther}
              onChangeText={setColorOther}
              style={styles.input}
              theme={inputTheme}
            />
          </View>
        )}


        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={gender}
            onValueChange={setGender}
            style={styles.picker}
            dropdownIconColor={Theme.TERTIARY}
          >
            <Picker.Item label="Selecione o gênero" value="" />
            <Picker.Item label="Macho" value="male" />
            <Picker.Item label="Fêmea" value="female" />
          </Picker>
        </View>

        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={size}
            onValueChange={setSize}
            style={styles.picker}
            dropdownIconColor={Theme.TERTIARY}
          >
            <Picker.Item label="Selecione o porte" value="" />
            <Picker.Item label="Pequeno" value="pequeno" />
            <Picker.Item label="Médio" value="medio" />
            <Picker.Item label="Grande" value="grande" />
          </Picker>
        </View>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={temperament}
            onValueChange={setTemperament}
            style={styles.picker}
            dropdownIconColor={Theme.TERTIARY}
          >
            <Picker.Item label="Selecione o temperamento" value="" />
            <Picker.Item label="Tímido" value="shy" />
            <Picker.Item label="Protetor" value="protective" />
            <Picker.Item label="Independente" value="independent" />
            <Picker.Item label="Sociável" value="sociable" />
            <Picker.Item label="Calmo" value="calm" />
            <Picker.Item label="Agressivo" value="aggressive" />
            <Picker.Item label="Brincalhão" value="playful" />
            <Picker.Item label="Desconhecido" value="unknown" />
          </Picker>
        </View>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={health}
            onValueChange={setHealth}
            style={styles.picker}
            dropdownIconColor={Theme.TERTIARY}
          >
            <Picker.Item label="Selecione o estado de saúde" value="" />
            <Picker.Item label="Saudável" value="healthy" />
            <Picker.Item label="Doente" value="sick" />
            <Picker.Item label="Recuperando" value="recovering" />
            <Picker.Item label="Deficiente" value="disabled" />
            <Picker.Item label="Desconhecido" value="unknown" />
          </Picker>
        </View>
        <ImageUploadInput images={animalImages} setImages={setAnimalImages} />

        <TouchableOpacity onPress={() => { setVaccinated(v => !v) }} style={styles.switchRow}>
          <Text style={styles.switchLabel}>Vacinado</Text>
          <Text style={{ color: vaccinated ? Theme.PRIMARY : '#888' }}>{vaccinated ? 'Sim' : 'Não'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setNeutered(v => !v) }} style={styles.switchRow}>
          <Text style={styles.switchLabel}>Castrado</Text>
          <Text style={{ color: neutered ? Theme.PRIMARY : '#888' }}>{neutered ? 'Sim' : 'Não'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setDewormed(v => !v) }} style={styles.switchRow}>
          <Text style={styles.switchLabel}>Vermifugado</Text>
          <Text style={{ color: dewormed ? Theme.PRIMARY : '#888' }}>{dewormed ? 'Sim' : 'Não'}</Text>
        </TouchableOpacity>
      </ScrollView>
      <CustomButton
        title="Cadastrar"
        color={Theme.PRIMARY}
        onPress={handleCreate}
        buttonStyle={{ margin: 24 }}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1
  },
  input: {
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8
  },
  switchLabel: {
    fontSize: 16,
    color: '#222',
  },
  pickerLabel: {
    fontSize: 16,
    color: '#222',
    marginBottom: 4,
    marginTop: 8,
    marginLeft: 2,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    width: '100%',
    color: '#222',
  },
  inputContainerWithLabel: {
    width: '100%',
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