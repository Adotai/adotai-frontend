import React, { useState, useEffect, useMemo } from 'react'; // 1. Importar useMemo
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchAnimalsByOng } from '../../actions/ongActions';
import { Theme } from '../../../constants/Themes';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getLoggedOngId } from '../../actions/userActions';
import DogCard from '../../Components/DogCard';
import { RootStackParamList } from '../../types';

export default function ONGAnimalsScreen({ }) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [originalAnimals, setOriginalAnimals] = React.useState<any[]>([]); // Guarda os aprovados
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [showFilters, setShowFilters] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  // 2. Adicionar estado para o filtro de espécie
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'dog' | 'cat'>('all');
  const [adoptionFilter, setAdoptionFilter] = React.useState<'all' | 'adopted' | 'notAdopted'>('all');

  const load = async () => {
    setLoading(true);
    const ongId = await getLoggedOngId();
    if (ongId) {
      const allAnimalsFromApi = await fetchAnimalsByOng(ongId);
      const approvedAnimals = allAnimalsFromApi.filter(animal =>
        animal.solicitationStatus === false
      );
      setOriginalAnimals(approvedAnimals);
    } else {
      setOriginalAnimals([]);
    }
    setLoading(false);
  };

  // Recarrega quando a tela ganha foco
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      load();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setSearchQuery('');
    setShowFilters(false);
    setActiveFilter('all'); // 3. Resetar filtro de espécie no refresh
    setRefreshing(false);
  };

  // 4. USAR useMemo para filtragem combinada (copiado da sua tela base)
  const filteredAnimals = useMemo(() => {
    let tempAnimals = originalAnimals;

    // Filtro de espécie
    if (activeFilter === 'dog') {
      tempAnimals = tempAnimals.filter(animal =>
        animal.species?.toLowerCase() === 'cachorro' || animal.species?.toLowerCase() === 'dog'
      );
    } else if (activeFilter === 'cat') {
      tempAnimals = tempAnimals.filter(animal =>
        animal.species?.toLowerCase() === 'gato' || animal.species?.toLowerCase() === 'cat'
      );
    }

    // Filtro de adoção
    if (adoptionFilter === 'adopted') {
      tempAnimals = tempAnimals.filter(animal => animal.status === false);
    } else if (adoptionFilter === 'notAdopted') {
      tempAnimals = tempAnimals.filter(animal => animal.status === true);
    }

    // Filtro de busca
    if (searchQuery !== '') {
      tempAnimals = tempAnimals.filter(animal =>
        animal.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return tempAnimals;
  }, [activeFilter, originalAnimals, searchQuery, adoptionFilter]); // 5. Depende dos 3 estados

  return (
    <>
      <StatusBar backgroundColor={Theme.TERTIARY} barStyle="light-content" />
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Theme.BACK }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={styles.headerTitle}>Animais</Text>
          </View>
          {/* Ícone de filtro */}
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateAnimal')}
            style={{ marginRight: 12, borderRadius: 8, padding: 8, flexDirection: 'row', alignItems: 'center' }}
          >
            {/* <Text style={styles.createAnimalText}>Cadastrar</Text> */}
            <Ionicons name="add-circle-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            {showFilters ? (
              <MaterialCommunityIcons name="filter-check" size={28} color={Theme.PASTEL} />
            ) : (
              <MaterialCommunityIcons name="filter-menu-outline" size={28} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* 6. Área de Filtro Completa (copiada da sua tela base) */}
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
                onChangeText={(text) => setSearchQuery(text)} // Atualiza o estado da busca
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#888" style={styles.searchIcon} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filtros de Espécie */}
            <Text style={{padding: 8, fontFamily: 'Poppins-SemiBold', color: Theme.TERTIARY}}>Espécies:</Text>
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
            
            <Text style={{padding: 8, fontFamily: 'Poppins-SemiBold', color: Theme.TERTIARY}}>Status:</Text>
            <View style={[styles.filtersRow]}>
              <TouchableOpacity
                style={adoptionFilter === 'all' ? styles.activeBarFilter : styles.inactiveBarFilter}
                onPress={() => setAdoptionFilter('all')}
              >
                <Text style={adoptionFilter === 'all' ? styles.activeFilterText : styles.inactiveFilterText}>Todos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={adoptionFilter === 'notAdopted' ? styles.activeBarFilter : styles.inactiveBarFilter}
                onPress={() => setAdoptionFilter('notAdopted')}
              >
                <Text style={adoptionFilter === 'notAdopted' ? styles.activeFilterText : styles.inactiveFilterText}>Disponíveis</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={adoptionFilter === 'adopted' ? styles.activeBarFilter : styles.inactiveBarFilter}
                onPress={() => setAdoptionFilter('adopted')}
              >
                <Text style={adoptionFilter === 'adopted' ? styles.activeFilterText : styles.inactiveFilterText}>Adotados</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={Theme.PRIMARY} style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={filteredAnimals} // 7. Usa a lista filtrada pelo useMemo
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
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {originalAnimals.length === 0
                    ? "Nenhum animal cadastrado."
                    : "Nenhum animal encontrado com esse nome."}
                </Text>
              }
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

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
  createAnimalText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
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