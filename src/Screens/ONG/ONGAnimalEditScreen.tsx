import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Theme } from '../../../constants/Themes';
import CustomButton from '../../Components/CustomButton';
import * as ImagePicker from 'expo-image-picker';
import { uploadFileToStorage } from '../../services/uploadFileToStorage';
import { updateAnimal, deleteAnimalPhoto } from '../../actions/ongActions';

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

export default function ONGAnimalEditScreen({ route }: any) {
  const navigation = useNavigation();
  const { animal } = route.params;

  const [name, setName] = useState(animal?.name || '');
  const [animalDescription, setAnimalDescription] = useState(animal?.animalDescription || '');
  const [breed, setBreed] = useState(animal?.breed || '');
const [color, setColor] = useState(animal?.color || '');
  const [age, setAge] = useState(animal?.age ? String(animal.age) : '');
  const [species, setSpecies] = useState(animal?.species?.description || 'Dog');
  const [gender, setGender] = useState(animal?.gender || 'male');
  const [size, setSize] = useState(animal?.size || 'pequeno');
  const [temperament, setTemperament] = useState(animal?.temperament || 'shy');
  const [health, setHealth] = useState(animal?.health || 'healthy');
  const [vaccinated, setVaccinated] = useState(!!animal?.vaccinated);
  const [neutered, setNeutered] = useState(!!animal?.neutered);
  const [dewormed, setDewormed] = useState(!!animal?.dewormed);
  const [images, setImages] = useState<any[]>(animal?.photos || []);

  // Adicionar nova imagem
  const handlePickImage = async () => {
    if (images.length >= 3) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 3 - images.length,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImages = [
        ...images,
        ...result.assets.map((a: any) => ({ uri: a.uri }))
      ].slice(0, 3);
      setImages(newImages);
    }
  };

  // Remover imagem (local ou backend)
  const handleRemoveImage = async (idx: number) => {
    const img = images[idx];
    if (img.id) {
      try {
        await deleteAnimalPhoto(animal.id, img.id);
        setImages(images.filter((_, i) => i !== idx));
      } catch {
        Alert.alert('Erro', 'Erro ao remover foto do servidor.');
      }
    } else {
      setImages(images.filter((_, i) => i !== idx));
    }
  };

  const handleSave = async () => {
    try {
      let photoObjs: any[] = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.uri && !img.photoUrl) {
          const url = await uploadFileToStorage(
            img.uri,
            `animals/${animal.id}/fotos/${Date.now()}_${i}.jpg`
          );
          photoObjs.push({ photoUrl: url });
        } else if (img.photoUrl || img.id) {
          photoObjs.push({ id: img.id, photoUrl: img.photoUrl });
        }
      }

      const animalObj = {
        id: animal.id,
        name,
        animalDescription,
        breed: { name: breed, speciesDescription: species },
        color: { name: color },
        age: Number(age),
        species: { description: species },
        gender,
        size,
        temperament,
        health,
        vaccinated,
        neutered,
        dewormed,
        photos: photoObjs,
        status: animal.status,
        ongId: animal.ongId,
      };

      await updateAnimal(animalObj);
      Alert.alert('Sucesso', 'Animal atualizado!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erro', 'Erro ao atualizar animal.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Fotos do Animal</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
        {images.map((img, idx) => (
          <View key={idx} style={{ margin: 8, alignItems: 'center' }}>
            <Image source={{ uri: img.uri || img.photoUrl }} style={styles.imagePreview} />
            <TouchableOpacity onPress={() => handleRemoveImage(idx)}>
              <Text style={{ color: '#d33', fontSize: 12 }}>Remover</Text>
            </TouchableOpacity>
          </View>
        ))}
        {images.length < 3 && (
          <TouchableOpacity onPress={handlePickImage} style={{ justifyContent: 'center', alignItems: 'center', margin: 8 }}>
            <Text style={{ fontSize: 32, color: '#888' }}>+</Text>
          </TouchableOpacity>
        )}
      </View>
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
      />
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
          selectedValue={species}
          onValueChange={setSpecies}
          style={styles.picker}
          dropdownIconColor={Theme.TERTIARY}
        >
          <Picker.Item label="Cão" value="Dog" />
          <Picker.Item label="Gato" value="Cat" />
        </Picker>
      </View>
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
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={size}
          onValueChange={setSize}
          style={styles.picker}
          dropdownIconColor={Theme.TERTIARY}
        >
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
      {/* Fotos */}

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Vacinado</Text>
        <TouchableOpacity onPress={() => setVaccinated(v => !v)}>
          <Text style={{ color: vaccinated ? Theme.PRIMARY : '#888' }}>{vaccinated ? 'Sim' : 'Não'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Castrado</Text>
        <TouchableOpacity onPress={() => setNeutered(v => !v)}>
          <Text style={{ color: neutered ? Theme.PRIMARY : '#888' }}>{neutered ? 'Sim' : 'Não'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Vermifugado</Text>
        <TouchableOpacity onPress={() => setDewormed(v => !v)}>
          <Text style={{ color: dewormed ? Theme.PRIMARY : '#888' }}>{dewormed ? 'Sim' : 'Não'}</Text>
        </TouchableOpacity>
      </View>
      <CustomButton
        title="Salvar"
        color={Theme.PRIMARY}
        onPress={handleSave}
        buttonStyle={{ margin: 24 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
    alignItems: 'center'
  },
  input: {
    marginBottom: 12,
    width: width * .85,
    backgroundColor: '#fff',
    alignSelf: 'center',
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    color: Theme.PRIMARY,
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
    alignSelf: 'flex-start'
  },
  imagePreview: {
    width: width * 0.25,
    height: height * 0.20,
    borderRadius: 8
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    width: width * .85,
    alignSelf: 'center'
  },
  picker: {
    width: '100%',
    color: '#222',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width * .85,
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#222',
  },
});