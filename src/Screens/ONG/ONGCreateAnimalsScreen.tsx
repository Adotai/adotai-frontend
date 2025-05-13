import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CustomInput } from '../../Components/CustomInput';
import CustomButton from '../../Components/CustomButton';

export default function ONGCreateAnimalsScreen({ navigation }: any) {
  const [name, setName] = React.useState('');
  const [breed, setBreed] = React.useState('');
  const [age, setAge] = React.useState('');
  const [image, setImage] = React.useState('');

  const handleCreate = () => {
    // Aqui você pode chamar a action para criar o animal
    Alert.alert('Animal criado!', `Nome: ${name}\nRaça: ${breed}\nIdade: ${age}\nImagem: ${image}`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <CustomInput label="Nome" value={name} onChange={setName} />
      <CustomInput label="Raça" value={breed} onChange={setBreed} />
      <CustomInput label="Idade" value={age} onChange={setAge} />
      <CustomInput label="URL da Imagem" value={image} onChange={setImage} />
      <CustomButton
        title="Cadastrar"
        color="#AD334A"
        onPress={handleCreate}
        buttonStyle={{ marginTop: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  }
});