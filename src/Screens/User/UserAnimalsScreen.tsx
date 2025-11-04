import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Dimensions,
  FlatList,
  StatusBar,
  TouchableOpacity,
  TextInput // 1. Importar TextInput
} from 'react-native'
import React, { useState, useEffect } from 'react' // 2. Importar useState/useEffect (já estava)
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
  const [animals, setAnimals] = React.useState<any[]>([]); // Lista original do estado
  const [ongs, setOngs] = React.useState<any[]>([]);
  const [selectedState, setSelectedState] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(selectedState);
  const [items, setItems] = React.useState(estados.map(uf => ({ label: uf, value: uf })));
  const [showFilters, setShowFilters] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'dog' | 'cat'>('all');
  // 3. Adicionar estado para a query de busca
  const [searchQuery, setSearchQuery] = React.useState('');

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
      // Limpa a busca e os filtros ao trocar de estado
      setSearchQuery('');
      setActiveFilter('all');
      const [animalsData, ongsData] = await Promise.all([
        fetchAnimalsByState(selectedState),
        fetchOngs()
      ]);
      setAnimals(animalsData);
      setOngs(ongsData);
    };
    load();
  }, [selectedState]); // Roda sempre que o estado mudar

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
    // 4. Limpar filtros ao dar refresh
    setSearchQuery('');
    setActiveFilter('all');
    setShowFilters(false);
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

  // 5. Atualizar o useMemo para incluir a busca por nome
  const filteredAnimals = React.useMemo(() => {
    let tempAnimals = animals; // Começa com a lista completa do estado

    // 1. Filtra por espécie (lógica que já existia)
    if (activeFilter === 'dog') {
      tempAnimals = tempAnimals.filter(animal =>
        animal.species?.toLowerCase() === 'cachorro' || animal.species?.toLowerCase() === 'dog'
      );
    } else if (activeFilter === 'cat') {
      tempAnimals = tempAnimals.filter(animal =>
        animal.species?.toLowerCase() === 'gato' || animal.species?.toLowerCase() === 'cat'
      );
    }
    // Se for 'all', não faz nada

    // 2. Filtra o resultado anterior pela busca por nome
    if (searchQuery !== '') {
      tempAnimals = tempAnimals.filter(animal =>
        animal.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return tempAnimals;
  }, [activeFilter, animals, searchQuery]); // 6. Adiciona searchQuery às dependências


  return (
    <>
      <StatusBar backgroundColor={Theme.TERTIARY} barStyle="light-content" />
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.header}>
          <Image style={{ width: width * 0.25, height: height * 0.05, tintColor: Theme.BACK }}
            source={require('../../../assets/images/adotai-text.png')} />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {selectedState && (
              <Picker
                selectedValue={selectedState}
                onValueChange={(itemValue) => setSelectedState(itemValue)}
                style={{ width: 105, height: 'auto', color: '#fff' }}
                dropdownIconColor={'#fff'} // Melhora a visibilidade do ícone do picker
              >
                {estados.map((uf) => (
                  <Picker.Item key={uf} label={uf} value={uf} style={{ color: 'black' }} /> // Cor dos itens
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

        {/* 7. Adicionar o TextInput dentro do bloco do showFilters */}
        {showFilters && (
          <View style={styles.filterAreaContainer}>
            {/* Barra de Busca */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nome do animal..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text)}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#888" style={styles.searchIcon} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filtros de Espécie */}
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
          </View>
        )}

        {/* 8. Lista agora usa filteredAnimals */}
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
          // 9. Mensagem de vazio atualizada
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {animals.length === 0
                ? "Nenhum animal encontrado para esta região."
                : "Nenhum animal corresponde aos filtros."}
            </Text>
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.listContainer}
        />
      </SafeAreaView>
    </>
  )
}

// 10. Novos estilos adicionados
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.BACK, // Usando Theme.BACK
  },
  header: {
    width: '100%',
    padding: 16,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: Theme.TERTIARY,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: Theme.BACK
  },
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10,
    paddingTop: 10, // Adiciona um espaço no topo da lista
  },
  filterAreaContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.BACK, // Fundo cinza claro
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10, // Espaço entre a busca e os botões
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around', // space-around fica melhor
    alignItems: 'center',
    // Removido o margin para o container pai controlar
  },
  activeBarFilter: {
    paddingVertical: 8,
    paddingHorizontal: 8, // Padding horizontal
    borderWidth: 2,
    borderRadius: 8,
    borderColor: Theme.PRIMARY,
    backgroundColor: Theme.PASTEL,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, // Faz os botões ocuparem espaço igual
    marginHorizontal: 4, // Adiciona espaço entre botões
  },
  activeFilterText: {
    fontFamily: "Poppins-SemiBold",
    color: Theme.PRIMARY
  },
  inactiveFilterText: {
    fontFamily: "Poppins-SemiBold",
    color: 'grey'
  },
  inactiveBarFilter: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: Theme.INPUT,
    backgroundColor: Theme.BACK,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, // Faz os botões ocuparem espaço igual
    marginHorizontal: 4, // Adiciona espaço entre botões
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  }
});