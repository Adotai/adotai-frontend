import React, { useState, useEffect } from 'react'; // 1. Importar useState e useEffect
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity, // 2. Importar TouchableOpacity
  TextInput,      // 3. Importar TextInput
  ActivityIndicator // 4. Importar ActivityIndicator
} from 'react-native';
// ... (outras importações)
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchAnimalsByOng } from '../../actions/ongActions';
import { Theme } from '../../../constants/Themes';
import { Ionicons } from '@expo/vector-icons'; // 5. Importar Ionicons
import { getLoggedOngId } from '../../actions/userActions';
import DogCard from '../../Components/DogCard';
import { RootStackParamList } from '../../types';

export default function ONGAnimalsScreen({ }) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  // 6. Estados para a lista original, a lista filtrada, e o filtro
  const [originalAnimals, setOriginalAnimals] = React.useState<any[]>([]); // Guarda a lista completa
  const [filteredAnimals, setFilteredAnimals] = React.useState<any[]>([]); // Guarda a lista exibida
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true); // Estado de loading inicial
  const [isFilterVisible, setIsFilterVisible] = React.useState(false); // Controla a barra de busca
  const [searchQuery, setSearchQuery] = React.useState(''); // Controla o texto da busca

  const load = async () => {
    setLoading(true);
    const ongId = await getLoggedOngId();
    if (ongId) {
      const allAnimalsFromApi = await fetchAnimalsByOng(ongId);

      // 1. FILTRAR PARA MOSTRAR SÓ ANIMAIS APROVADOS
      // Aprovado = solicitationStatus é FALSE
      const approvedAnimals = allAnimalsFromApi.filter(animal =>
        animal.solicitationStatus === false
      );

      setOriginalAnimals(approvedAnimals);
      setFilteredAnimals(approvedAnimals);
    } else {
      // ...
    }
    setLoading(false);
  };

  React.useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setSearchQuery(''); // Limpa a busca ao atualizar
    setIsFilterVisible(false); // Fecha o filtro ao atualizar
    setRefreshing(false);
  };

  // 9. Função que filtra a lista (no front-end)
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text === '') {
      // Se a busca está vazia, mostra todos os animais
      setFilteredAnimals(originalAnimals);
    } else {
      // Filtra a lista original pelo nome
      const filtered = originalAnimals.filter(animal =>
        animal.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredAnimals(filtered);
    }
  };

  return (
    <>
      <StatusBar backgroundColor={Theme.TERTIARY} barStyle="light-content" />
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Theme.BACK }}>
        {/* 10. Header modificado com ícone */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Animais
          </Text>
          <TouchableOpacity onPress={() => setIsFilterVisible(!isFilterVisible)}>
            {/* Mostra 'fechar' se o filtro estiver aberto, 'buscar' se estiver fechado */}
            <Ionicons name={isFilterVisible ? "close" : "search"} size={24} color={Theme.BACK} />
          </TouchableOpacity>
        </View>

        {/* 11. Barra de Filtro (Renderização Condicional) */}
        {isFilterVisible && (
          <View style={styles.filterContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome do animal..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={handleSearch} // Chama a função de filtro
            />
          </View>
        )}

        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={Theme.PRIMARY} style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={filteredAnimals} // 12. Usa a lista FILTRADA
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
              // 13. Mensagem de "vazio" melhorada
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
  container: { // Este estilo não está sendo usado, pode remover se quiser
    flex: 1,
    padding: 8,
    backgroundColor: '#fff',
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
    color: Theme.BACK,
  },
  // 14. Novos estilos adicionados
  filterContainer: {
    backgroundColor: '#fff',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
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