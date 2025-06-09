import { StyleSheet, Text, View, Image, ScrollView, Dimensions, FlatList, StatusBar, TouchableOpacity } from 'react-native'
import React from 'react'
import DogCard from '../../Components/DogCard'
import { fetchAnimalsByState, fetchLoggedUser, fetchOngs } from '../../actions/userActions';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { Picker } from '@react-native-picker/picker';
import { Theme } from '../../../constants/Themes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';


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
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(selectedState);
  const [items, setItems] = React.useState(estados.map(uf => ({ label: uf, value: uf })));
  const [showFilters, setShowFilters] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'dog' | 'cat'>('all');



  React.useEffect(() => {
    if (selectedState && value !== selectedState) {
      setValue(selectedState);
    }
  }, [selectedState]);


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

  // Antes do return
const filteredAnimals = React.useMemo(() => {
  if (activeFilter === 'dog') {
    return animals.filter(animal =>
      animal.species?.toLowerCase() === 'cachorro' || animal.species?.toLowerCase() === 'dog'
    );
  }
  if (activeFilter === 'cat') {
    return animals.filter(animal =>
      animal.species?.toLowerCase() === 'gato' || animal.species?.toLowerCase() === 'cat'
    );
  }
  return animals;
}, [activeFilter, animals]);


  return (
    <>
      <StatusBar backgroundColor={Theme.TERTIARY} barStyle="dark-content" />
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={{
          width: '100%', padding: 16, marginTop: 0, alignSelf: 'center', alignItems: 'center',
          flexDirection: 'row', justifyContent: 'space-between',
          backgroundColor: Theme.TERTIARY,
        }}>
          <Image style={{ width: width * 0.25, height: height * 0.05, tintColor: Theme.BACK }}
            source={require('../../../assets/images/adotai-text.png')} />
          <View style={{
            flexDirection: 'row', alignItems: 'center'
          }}>
            {selectedState && (
              <Picker
                selectedValue={selectedState}
                onValueChange={(itemValue) => setSelectedState(itemValue)}
                style={{ width: 105, height: 'auto', color: '#fff' }}
              >
                {estados.map((uf) => (
                  <Picker.Item key={uf} label={uf} value={uf} />
                ))}
              </Picker>
            )}
           <TouchableOpacity onPress={() => setShowFilters(v => !v)}>
            {showFilters ? (
              <MaterialCommunityIcons name="filter-check" size={28} color={Theme.PASTEL} />
            ) : (
              <MaterialCommunityIcons name="filter-menu-outline" size={28} color="#fff" />
            )}
          </TouchableOpacity>
          </View>

        </View>
        {showFilters && (
  <View style={styles.filtersRow}>
    <TouchableOpacity
      style={activeFilter === 'all' ? styles.activeBarFilter : styles.inactiveBarFilter}
      onPress={() => setActiveFilter('all')}
    >
      <Text style={activeFilter === 'all' ? styles.activeFilterText : styles.inactiveFilterText}>Todos</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={activeFilter === 'cat' ? styles.activeBarFilter : styles.inactiveBarFilter}
      onPress={() => setActiveFilter('cat')}
    >
      <Text style={activeFilter === 'cat' ? styles.activeFilterText : styles.inactiveFilterText}>Gatos</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={activeFilter === 'dog' ? styles.activeBarFilter : styles.inactiveBarFilter}
      onPress={() => setActiveFilter('dog')}
    >
      <Text style={activeFilter === 'dog' ? styles.activeFilterText : styles.inactiveFilterText}>Cachorros</Text>
    </TouchableOpacity>
  </View>
)}

       <FlatList
  data={filteredAnimals}
  keyExtractor={item => String(item.id)}
  renderItem={({ item }) => (
    <DogCard
      name={item.name}
      image={item.photos && item.photos.length > 0 ? item.photos[0].photoUrl : ''}
      location={getOngLocation(item.ongId)}
      onPress={() => navigation.navigate('UserAnimalDetails', { animal: item, city: getOngLocation(item.ongId), ongName: getOngName(item.ongId), ongs, fromOngList: false })}
      status={item.status === false}
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
    backgroundColor: '#F5F6FA',
  },
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    margin: 10,
    marginBottom: 8,
    marginTop: 8
  },
  activeBarFilter: {
    padding: 32,
    paddingTop: 8,
    paddingBottom: 8,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: Theme.PRIMARY,
    backgroundColor: Theme.PASTEL,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeFilterText: {
    fontFamily: "Poppins-SemiBold",
    color: Theme.PRIMARY
  },
  inactiveFilterText:{
    fontFamily: "Poppins-SemiBold",
    color:'grey'
  },
  inactiveBarFilter: {
    padding: 32,
    paddingTop: 8,
    paddingBottom: 8,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: Theme.INPUT,
    backgroundColor: Theme.BACK,
    alignItems: 'center',
    justifyContent: 'center'
  },
});