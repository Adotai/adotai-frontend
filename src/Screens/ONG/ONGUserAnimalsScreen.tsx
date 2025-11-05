import {
  View,
  Text,
  StatusBar,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from 'react-native'
import React, { useState, useEffect, useMemo } from 'react' 
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types';
import { getLoggedOngId } from '../../actions/userActions';
import { fetchUserAnimals } from '../../actions/ongActions';
import DogCard from '../../Components/DogCard';
import { Theme } from '../../../constants/Themes';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ONGUserAnimalsScreen() {

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [originalAnimals, setOriginalAnimals] = React.useState<any[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [showFilters, setShowFilters] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'dog' | 'cat'>('all');

  const load = async () => {
    setLoading(true);
    const ongId = await getLoggedOngId();
    if (ongId) {
      const animalsFromApi = await fetchUserAnimals(ongId);
      setOriginalAnimals(animalsFromApi);
    } else {
      setOriginalAnimals([]);
    }
    setLoading(false);
  };

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
    setActiveFilter('all'); 
    setRefreshing(false);
  };

  const filteredAnimals = React.useMemo(() => {
    let tempAnimals = originalAnimals; 

   if (activeFilter === 'dog') {
      tempAnimals = tempAnimals.filter(animal =>
        animal.species?.toLowerCase() === 'cachorro' || animal.species?.toLowerCase() === 'dog'
      );
    } else if (activeFilter === 'cat') {
      tempAnimals = tempAnimals.filter(animal =>
        animal.species?.toLowerCase() === 'gato' || animal.species?.toLowerCase() === 'cat'
      );
    }

    if (searchQuery !== '') {
      tempAnimals = tempAnimals.filter(animal =>
        animal.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return tempAnimals;
  }, [activeFilter, originalAnimals, searchQuery]); 

  return (
    <>
      <StatusBar backgroundColor={Theme.TERTIARY} barStyle="light-content" />
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Theme.BACK }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Solicitações
          </Text>
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            {showFilters ? (
              <MaterialCommunityIcons name="filter-check" size={28} color={Theme.PASTEL} />
            ) : (
              <MaterialCommunityIcons name="filter-menu-outline" size={28} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filterAreaContainer}>
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

        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={Theme.PRIMARY} style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={filteredAnimals} 
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => (
                <DogCard
                  name={item.name}
                  image={item.photos && item.photos.length > 0 ? item.photos[0].photoUrl : ''}
                  location={item.species === 'DOG' ? 'Cachorro' : 'Gato'}
                  onPress={() => navigation.navigate('ONGAnimalDetails', { animal: item })}
                  status={false}
                  statusText="Pendente"
                  canEdit={true}
                />
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {originalAnimals.length === 0
                    ? "Nenhuma solicitação pendente."
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
    backgroundColor: Theme.BACK, 
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
    paddingTop: 10, 
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
    backgroundColor: Theme.BACK, 
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
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
    justifyContent: 'space-around', 
    alignItems: 'center',
  },
  activeBarFilter: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: Theme.PRIMARY,
    backgroundColor: Theme.PASTEL,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, 
    marginHorizontal: 4, 
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
    flex: 1, 
    marginHorizontal: 4, 
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  }
});