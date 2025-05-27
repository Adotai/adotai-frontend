import { StyleSheet, Text, View, Image, ScrollView, SafeAreaView, Dimensions, FlatList, StatusBar } from 'react-native'
import React from 'react'
import DogCard from '../../Components/DogCard'
import { fetchAnimalsByState, fetchLoggedUser, fetchOngs } from '../../actions/userActions';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { Picker } from '@react-native-picker/picker';


const { width, height } = Dimensions.get('window');

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function UserAnimalsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [animals, setAnimals] = React.useState<any[]>([]);
  const [ongs, setOngs] = React.useState<any[]>([]);
  const [selectedState, setSelectedState] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    const init = async () => {
      const user = await fetchLoggedUser();
      if (user?.state && estados.includes(user.state)) {
        setSelectedState(user.state);
      } else {
        setSelectedState('SP');
      }
    };
    init();
  }, []);

  React.useEffect(() => {
    const load = async () => {
      if (!selectedState) return;
      const [animalsData, ongsData] = await Promise.all([
        fetchAnimalsByState(selectedState),
        fetchOngs()
      ]);
      setAnimals(animalsData);
      setOngs(ongsData);
    };
    load();
  }, [selectedState]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedState) {
      const [animalsData, ongsData] = await Promise.all([
        fetchAnimalsByState(selectedState),
        fetchOngs()
      ]);
      setAnimals(animalsData);
      setOngs(ongsData);
    }
    setRefreshing(false);
  };

  const getOngLocation = (ongId: number) => {
    const ong = ongs.find(o => o.id === ongId);
    if (ong && ong.address) {
      return `${ong.address.city}, ${ong.address.state}`;
    }
    return '';
  };

  const getOngName = (ongId: number) => {
    const ong = ongs.find(o => o.id === ongId);
    return ong ? ong.name : '';
  };

  return (
    <>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 8 }}>
          <Image style={{ width: width * 0.5, height: height * 0.05 }} source={require('../../../assets/images/adotai-text.png')} />
          {selectedState && (
            <Picker
              selectedValue={selectedState}
              onValueChange={(itemValue) => setSelectedState(itemValue)}
              style={{ width: 120, height: 'auto' }}
              itemStyle={{ fontSize: 16 }}
            >
              {estados.map((uf) => (
                <Picker.Item key={uf} label={uf} value={uf} />
              ))}
            </Picker>
          )}
        </View>
        <FlatList
          data={animals}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <DogCard
              name={item.name}
              image={item.photos && item.photos.length > 0 ? item.photos[0].photoUrl : ''}
              location={getOngLocation(item.ongId)}
              onPress={() => navigation.navigate('UserAnimalDetails', { animal: item, city: getOngLocation(item.ongId), ongName: getOngName(item.ongId), ongs })}
            />
          )}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32 }}>Nenhum animal encontrado para região.</Text>}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.listContainer}
        />
      </SafeAreaView>
    </>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
});