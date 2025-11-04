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
import React, { useState, useEffect } from 'react'
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types';
import { getLoggedOngId } from '../../actions/userActions';
// 1. Mude a importação de 'fetchUserAnimals' para 'fetchAnimalsByOng'
import { fetchAnimalsByOng,  fetchUserAnimals } from '../../actions/ongActions'; // Verifique o caminho
import DogCard from '../../Components/DogCard';
import { Theme } from '../../../constants/Themes';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native'; // Importar Alert

export default function ONGUserAnimalsScreen() {

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [originalAnimals, setOriginalAnimals] = React.useState<any[]>([]); // Guarda a lista de pendentes
  const [filteredAnimals, setFilteredAnimals] = React.useState<any[]>([]); // Guarda a lista filtrada
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [isFilterVisible, setIsFilterVisible] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const load = async () => {
    setLoading(true);
    const ongId = await getLoggedOngId();
    if (ongId) {
      // 1. Chame a action correta (que o backend já filtra)
      const animalsFromApi = await fetchUserAnimals(ongId);

      // 2. NÃO PRECISA MAIS FILTRAR NO FRONTEND
      setOriginalAnimals(animalsFromApi);
      setFilteredAnimals(animalsFromApi);
    } else {
      // ...
    }
    setLoading(false);
  };

  // Recarrega a lista quando a tela recebe foco (ex: após aprovar um animal)
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
    setIsFilterVisible(false);
    setRefreshing(false);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text === '') {
      setFilteredAnimals(originalAnimals); // Mostra todos os pendentes
    } else {
      // Filtra a lista de pendentes pelo nome
      const filtered = originalAnimals.filter(animal =>
        animal.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredAnimals(filtered);
    }
  };

  // 4. Função para o botão "Aprovar"
  const handleApprove = async (animal: any) => {
    Alert.alert(
      "Aprovar Animal",
      `Você tem certeza que deseja aprovar "${animal.name}"? Esta ação o tornará público para adoção.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aprovar",
          style: "default",
          onPress: async () => {
            try {
            
              Alert.alert("Ação Incompleta", "A action 'approveAnimalSubmission' precisa ser ajustada para enviar { solicitationStatus: false }.");
            } catch (error) {
              console.error("Erro ao aprovar:", error);
            }
          }
        }
      ]
    );
  };

  return (
    <>
      <StatusBar backgroundColor={Theme.TERTIARY} barStyle="light-content" />
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Theme.BACK }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Solicitações
          </Text>
          <TouchableOpacity onPress={() => setIsFilterVisible(!isFilterVisible)}>
            <Ionicons name={isFilterVisible ? "close" : "search"} size={24} color={Theme.BACK} />
          </TouchableOpacity>
        </View>

        {/* Barra de Filtro */}
        {isFilterVisible && (
          <View style={styles.filterContainer}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nome do animal..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <Ionicons name="close-circle" size={20} color="#888" style={styles.searchIcon} />
                </TouchableOpacity>
              )}
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
                  status={false} // Dizemos ao card que ele NÃO está adotado
                  statusText="Pendente" // E passamos o texto que queremos exibir
                  canEdit={true}
                // Aqui você pode adicionar um botão "Aprovar" no seu DogCard
                // onApprove={() => handleApprove(item)} 
                />
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {originalAnimals.length === 0
                    ? "Nenhuma solicitação pendente." // Texto atualizado
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
  filterContainer: {
    backgroundColor: '#fff',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.BACK,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: Theme.BACK,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  listContainer: {
    flex: 1,
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  }
});