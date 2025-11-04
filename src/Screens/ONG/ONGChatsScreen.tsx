import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback, useMemo } from 'react'; // 1. Importar useState e useMemo
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet, // 2. Importar StyleSheet
  TextInput     // 3. Importar TextInput
} from 'react-native';
import { Theme } from '../../../constants/Themes';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchChatsByAccount } from '../../actions/actions';
import { fetchUsers } from '../../actions/ongActions';
import { Ionicons } from '@expo/vector-icons'; // 4. Importar Ionicons

export default function ONGChatsScreen({ navigation }: any) {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<any[]>([]); // Lista de todos os Usuários
  // 5. Novos estados para o filtro
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadChats = useCallback(async () => {
    try {
      const ongJson = await AsyncStorage.getItem('user');
      const ong = ongJson ? JSON.parse(ongJson) : null;
      if (!ong?.id) {
        setChats([]);
        setLoading(false);
        return;
      }

      // Busque chats e usuários em paralelo
      const [chatResult, usersList] = await Promise.all([
        fetchChatsByAccount(ong.id),
        fetchUsers() // Chame a função aqui
      ]);

      setChats(chatResult || []);
      setUsers(usersList || []);

    } catch (e) {
      setChats([]);
      setUsers([]);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const onRefresh = () => {
    setRefreshing(true);
    setSearchQuery(''); // 6. Limpa a busca ao atualizar
    setIsFilterVisible(false); // Fecha o filtro
    loadChats();
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : `Usuário #${userId}`;
  };

  // 7. useMemo para filtrar os chats pelo nome do USUÁRIO
  const filteredChats = useMemo(() => {
    if (searchQuery === '') {
      return chats; // Sem filtro, retorna todos os chats
    }
    const lowerCaseQuery = searchQuery.toLowerCase();

    // 1. Encontra os IDs dos USUÁRIOS que correspondem à busca
    const matchedUserIds = users
      .filter(user => user.name && user.name.toLowerCase().includes(lowerCaseQuery))
      .map(user => user.id);

    // 2. Filtra os chats que pertencem a esses USUÁRIOS
    return chats.filter(chat => matchedUserIds.includes(chat.userId));
  }, [searchQuery, chats, users]); // Depende da busca, dos chats e dos usuários

  return (
    <>
      <StatusBar backgroundColor={Theme.TERTIARY} style="light" />
      <SafeAreaView edges={['top']} style={styles.container}>
        {/* 8. Header modificado com ícone */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Chats com Usuários
          </Text>
          <TouchableOpacity onPress={() => setIsFilterVisible(!isFilterVisible)}>
            <Ionicons name={isFilterVisible ? "close" : "search"} size={24} color={Theme.BACK} />
          </TouchableOpacity>
        </View>

        {/* 9. Barra de Busca Condicional */}
        {isFilterVisible && (
          <View style={styles.filterAreaContainer}>
            {/* Barra de Busca */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nome do usuário..." // Texto do placeholder atualizado
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

        <View style={{ flex: 1 }}>
          {loading ? (
            <ActivityIndicator size="large" color={Theme.PRIMARY} style={{ marginTop: 32 }} />
          ) : (
            <FlatList
              data={filteredChats} // 10. Usa a lista filtrada
              keyExtractor={item => String(item.id)}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Theme.PRIMARY]} />
              }
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {/* 11. Mensagem de vazio melhorada */}
                  {chats.length === 0
                    ? "Nenhum chat encontrado."
                    : "Nenhum chat corresponde à sua busca."}
                </Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.chatItem} // 12. Usando estilo do StyleSheet
                  onPress={async () => {
                    const ongJson = await AsyncStorage.getItem('user');
                    const ong = ongJson ? JSON.parse(ongJson) : null;
                    navigation.navigate('Chat', {
                      chatId: String(item.id),
                      loggedInUserId: ong?.id
                    });
                  }}
                >
                  <Text style={styles.chatItemText}>
                    {getUserName(item.userId)}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

// 13. Adicionando StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.BACK
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
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 32,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  chatItem: {
    backgroundColor: '#fff',
    paddingVertical: 24, // Aumentei o padding para ficar mais parecido
    paddingHorizontal: 16,
    borderBottomWidth: 1, // Linha separadora
    borderBottomColor: '#f0f0f0',
    elevation: 1
  },
  chatItemText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  }
});