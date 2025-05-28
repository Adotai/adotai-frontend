import React from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar } from 'react-native';
import { fetchAnimals, getLoggedOngId } from '../../actions/userActions';
import DogCard from '../../Components/DogCard';
import { RootStackParamList } from '../../types';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ONGAnimalsScreen({ }) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [animals, setAnimals] = React.useState<any[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = async () => {
    const ongId = await getLoggedOngId();
    if (ongId) {
      // Busca todos os animais (ou use o fetch atual)
      const allAnimals = await fetchAnimals();
      // Filtra só os da ONG logada
      const filtered = allAnimals.filter(animal => animal.ongId === ongId);
      setAnimals(filtered);
    } else {
      setAnimals([]);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <>

      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <FlatList
          data={animals}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <DogCard
              name={item.name}
              image={item.photos && item.photos.length > 0 ? item.photos[0].photoUrl : ''}
              location={item.species === 'DOG' ? 'Cachorro' : 'Gato'}
              onPress={() => navigation.navigate('ONGAnimalDetails', { animal: item })}
            />
          )}
          ListEmptyComponent={<Text>Nenhum animal cadastrado.</Text>}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    backgroundColor: '#fff',
  },
});