import React from 'react';
import { View, StyleSheet, Alert, ScrollView, Switch, Text, TouchableOpacity, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createAnimal, getLoggedOngId } from '../../actions/userActions';
import { Button, TextInput } from 'react-native-paper';
import CustomButton from '../../Components/CustomButton';
import { Theme } from '../../../constants/Themes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { uploadFileToStorage } from '../../services/uploadFileToStorage';

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
      <Text style={{  fontFamily: 'Poppins-Regular' , fontSize: 14, color: Theme.PRIMARY}}>Fotos do Animal (até 3)</Text>
      <TouchableOpacity style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, justifyContent:'center', alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap' }} onPress={handlePickImage} disabled={images.length >= 3}>
        {images.length === 0 ? (
          <Text style={{ color: '#888' }}>Selecionar fotos</Text>
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
  const [species, setSpecies] = React.useState('Dog');
  const [gender, setGender] = React.useState('male');
  const [temperament, setTemperament] = React.useState('shy');
  const [health, setHealth] = React.useState('healthy');
  const [size, setSize] = React.useState('PEQUENO');
  const [vaccinated, setVaccinated] = React.useState(false);
  const [neutered, setNeutered] = React.useState(false);
  const [dewormed, setDewormed] = React.useState(false);
  const [ongId, setOngId] = React.useState<number | null>(null);
  const [images, setImages] = React.useState<any[]>([]);
  const [animalImages, setAnimalImages] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchOngId = async () => {
      const id = await getLoggedOngId();
      if (id) setOngId(id);
    };
    fetchOngId();
  }, []);

  const handleCreate = async () => {
    try {
      if (animalImages.length === 0) {
        Alert.alert('Erro', 'Adicione pelo menos uma foto do animal.');
        return;
      }
  
      // Use o nome do animal e timestamp para criar um path único
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
        color: { name: color || 'Brown' },
        breed: { name: breed, speciesDescription: species },
        species: { description: species },
        age: Number(age),
        health: health || 'GOOD',
        status: true,
        vaccinated,
        neutered,
        dewormed,
        temperament: temperament || 'FRIENDLY',
        photos, // <-- Envie as fotos aqui!
      };
  
      await createAnimal(animalObj);
      Alert.alert('Sucesso', 'Animal criado com sucesso!');
      navigation.goBack();
    } catch (e) {
      console.log('Erro ao criar animal:', e);
      Alert.alert('Erro', 'Falha ao criar animal.');
    }
  };

  return (
    <View style={{ alignItems: 'center', width: '100%', backgroundColor: '#fff', height: '100%' }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TextInput
          label="Nome"
          mode="outlined"
          value={name}
          onChangeText={setName}
          style={styles.input}
          theme={inputTheme}
        />
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={species}
            onValueChange={setSpecies}
            style={styles.picker}
            dropdownIconColor={Theme.TERTIARY}
          >
            <Picker.Item label="Cão" value="Dog" />
            <Picker.Item label="Gato" value="Cat" />
          </Picker>
        </View>
        <TextInput
          label="Raça"
          mode="outlined"
          value={breed}
          onChangeText={setBreed}
          style={styles.input}
          theme={inputTheme}
        />
      
        <TextInput
          label="Cor"
          mode="outlined"
          value={color}
          onChangeText={setColor}
          style={styles.input}
          theme={inputTheme}
        />
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={gender}
            onValueChange={setGender}
            style={styles.picker}
            dropdownIconColor={Theme.TERTIARY}
          >
            <Picker.Item label="Macho" value="male" />
            <Picker.Item label="Fêmea" value="female" />
          </Picker>
        </View>
        <TextInput
          label="Idade"
          mode="outlined"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          style={styles.input}
          theme={inputTheme}
        />
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={size}
            onValueChange={setSize}
            style={styles.picker}
            dropdownIconColor={Theme.TERTIARY}
          >
            <Picker.Item label="Pequeno" value="PEQUENO" />
            <Picker.Item label="Médio" value="MÉDIO" />
            <Picker.Item label="Grande" value="GRANDE" />
            <Picker.Item label="Extra Grande" value="EXTRA_GRANDE" />
          </Picker>
        </View>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={temperament}
            onValueChange={setTemperament}
            style={styles.picker}
            dropdownIconColor={Theme.TERTIARY}
          >
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
            <Picker.Item label="Saudável" value="healthy" />
            <Picker.Item label="Doente" value="sick" />
            <Picker.Item label="Recuperando" value="recovering" />
            <Picker.Item label="Deficiente" value="disabled" />
            <Picker.Item label="Desconhecido" value="unknown" />
          </Picker>
        </View>
       <ImageUploadInput images={animalImages} setImages={setAnimalImages} />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Vacinado</Text>
          <Switch
            value={vaccinated}
            onValueChange={setVaccinated}
            thumbColor={vaccinated ? Theme.TERTIARY : undefined}
            trackColor={{ false: '#ccc', true: Theme.PRIMARY }}
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Castrado</Text>
          <Switch
            value={neutered}
            onValueChange={setNeutered}
            thumbColor={neutered ? Theme.TERTIARY : undefined}
            trackColor={{ false: '#ccc', true: Theme.PRIMARY }}
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Vermifugado</Text>
          <Switch
            value={dewormed}
            onValueChange={setDewormed}
            thumbColor={dewormed ? Theme.TERTIARY : undefined}
            trackColor={{ false: '#ccc', true: Theme.PRIMARY }}
          />
        </View>
      </ScrollView>
      <CustomButton
        title="Cadastrar"
        color={Theme.PRIMARY}
        onPress={handleCreate}
        buttonStyle={{ margin: 24 }}

      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding:24,
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
});