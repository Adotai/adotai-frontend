import { View, Text, StatusBar, SafeAreaView, FlatList, StyleSheet } from 'react-native'
import React from 'react'
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { getLoggedOngId } from '../../actions/userActions';
import { fetchUserAnimals } from '../../actions/ongActions';
import DogCard from '../../Components/DogCard';




export default function ONGUserAnimalsScreen() {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [animals, setAnimals] = React.useState<any[]>([]);
    const [refreshing, setRefreshing] = React.useState(false);

    const load = async () => {
      const ongId = await getLoggedOngId();
      if (ongId) {
        const animalsFromApi = await fetchUserAnimals(ongId);
        setAnimals(animalsFromApi);
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
                status={item.status === false}
                canEdit={true}
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