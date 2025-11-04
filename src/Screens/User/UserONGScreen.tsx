import React, { useEffect, useState, useCallback, useMemo } from 'react'; // 1. Importar useState e useMemo
import {
  FlatList,
  RefreshControl,
  Text,
  Image,
  Dimensions,
  StatusBar,
  View,
  TouchableOpacity,
  TextInput, // 2. Importar TextInput
  StyleSheet, // 3. Importar StyleSheet
  ActivityIndicator // 4. Importar ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchLoggedUser, fetchOngs } from '../../actions/userActions';
import OngCard from '../../Components/OngCard';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { Picker } from '@react-native-picker/picker';
import { Theme } from '../../../constants/Themes';
import { Feather, Ionicons } from '@expo/vector-icons'; // 5. Importar Ionicons

const { width, height } = Dimensions.get('window');

type UserONGScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function UserONGScreen() {
  const [ongs, setOngs] = useState<any[]>([]); // 6. Esta é a lista filtrada por ESTADO
  const [loading, setLoading] = useState(true); // 7. Adicionar estado de loading
  const [refreshing, setRefreshing] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('');
  const navigation = useNavigation<UserONGScreenNavigationProp>();

  // 8. Novos estados para o filtro de nome
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadOngs = async (state?: string) => {
    setLoading(true);
    setOngs([]); // Limpa a lista antiga
    try {
      const allOngs = await fetchOngs();
      let filtered = allOngs.filter(ong => ong.status === true);
      if (state) {
        filtered = filtered.filter(ong => ong.address?.state === state);
      }
      setOngs(filtered);
    } catch (e) {
      console.error("Erro ao buscar ONGs:", e);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    // 9. Limpa a busca ao trocar de estado
    if (selectedState) {
      setSearchQuery('');
      setIsFilterVisible(false); // Fecha o filtro
      loadOngs(selectedState);
    }
  }, [selectedState]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSearchQuery(''); // Limpa a busca
    setIsFilterVisible(false); // Fecha o filtro
    loadOngs(selectedState).finally(() => setRefreshing(false));
  }, [selectedState]);

  // 10. useMemo para filtrar a lista de ONGs por nome
  const filteredOngs = useMemo(() => {
    if (searchQuery === '') {
      return ongs; // Retorna a lista filtrada por estado
    }
    // Filtra a lista (já filtrada por estado) pelo nome
    return ongs.filter(ong =>
      ong.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [ongs, searchQuery]); // Depende de 'ongs' (do estado) e 'searchQuery'

  return (
    <>
      <StatusBar backgroundColor={Theme.TERTIARY} barStyle="light-content" />
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.header}>
          <Image style={{ alignSelf: 'center', width: width * 0.25, height: height * 0.05, tintColor: Theme.BACK }}
            source={require('../../../assets/images/adotai-text.png')} />
          <View style={styles.headerRight}>
            <Picker
              selectedValue={selectedState}
              onValueChange={(itemValue) => setSelectedState(itemValue)}
              style={{ width: 105, color: 'white' }}
              dropdownIconColor={'#fff'}
            >
              {estados.map((estado) => (
                <Picker.Item key={estado} label={estado} value={estado} style={{ color: 'black' }} />
              ))}
            </Picker>
            {/* 11. Ícone de Filtro/Busca */}
            <TouchableOpacity onPress={() => setIsFilterVisible(!isFilterVisible)}>
              <Ionicons name={isFilterVisible ? "close" : "search"} size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 12. Barra de Busca Condicional */}
        {isFilterVisible && (
          <View style={styles.filterAreaContainer}>
            {/* Barra de Busca */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nome da ONG..."
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
          </View>
        )}

        {/* 13. Lógica de Loading ou Lista */}
        {loading ? (
          <ActivityIndicator size="large" color={Theme.PRIMARY} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={filteredOngs} // 14. Usa a lista filtrada
            keyExtractor={ong => ong.id?.toString() || Math.random().toString()}
            renderItem={({ item: ong }) => (
              <OngCard ong={ong} onPress={() => navigation.navigate('UserONGDetail', { ong })} />
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            // 15. Mensagem de vazio melhorada
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {ongs.length === 0
                  ? "Nenhuma ONG encontrada para esta região."
                  : "Nenhuma ONG corresponde à busca."}
              </Text>
            }
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.BACK
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
  header: {
    width: '100%',
    padding: 16,
    paddingRight: 16, // Ajuste para o picker/ícone
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: Theme.TERTIARY,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: '#fff',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  }
});