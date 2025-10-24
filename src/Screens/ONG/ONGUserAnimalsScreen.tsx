import { View, Text, StatusBar, FlatList, StyleSheet } from 'react-native'
import React from 'react'
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types';
import { getLoggedOngId } from '../../actions/userActions';
import { fetchUserAnimals } from '../../actions/ongActions';
import DogCard from '../../Components/DogCard';
import { Theme } from '../../../constants/Themes';




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
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Theme.BACK }}>
        <View style={{
          width: '100%', 
          padding: 16, 
          marginTop: 0, 
          alignSelf: 'center', 
          alignItems: 'center',
          justifyContent: 'space-between', 
          flexDirection: 'row', 
          backgroundColor: Theme.TERTIARY, 
          position: 'relative',
        }}>
          <Text style={{ 
            fontSize: 24, 
            fontFamily: 'Poppins-Bold', 
            color: Theme.BACK 
          }}>
            Solicitações de Usuários 
          </Text>
        </View>
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