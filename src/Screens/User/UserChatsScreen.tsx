import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Theme } from '../../../constants/Themes';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchChatsByAccount } from '../../actions/actions';
import { fetchOngs } from '../../actions/userActions'; // ajuste o caminho se necessário

export default function UserChatsScreen({ navigation }: any) {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ongs, setOngs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const loadChats = useCallback(async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;
      if (!user?.id) {
        setChats([]);
        setLoading(false);
        return;
      }
      const result = await fetchChatsByAccount(user.id);
      setChats(result || []);


      // Busque as ONGs e salve no estado
      const ongsList = await fetchOngs();
      setOngs(ongsList || []);

    } catch (e) {
      setChats([]);
      setOngs([]);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const onRefresh = () => {
    setRefreshing(true);
    loadChats();
  };

  // Função para pegar o nome da ONG pelo id
  const getOngName = (ongId: number) => {
    const ong = ongs.find(o => o.id === ongId);
    return ong ? ong.name : `ONG #${ongId}`;
  };

  // Função para pegar o nome do usuário pelo id (se quiser)
  // const getUserName = (userId: number) => {
  //   const user = users.find(u => u.id === userId);
  //   return user ? user.name : `Usuário #${userId}`;
  // };

  return (
    <>
      <StatusBar backgroundColor={Theme.TERTIARY} style="dark" />
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Theme.BACK }}>
        <View style={{
          width: '100%', padding: 16, marginTop: 0, alignSelf: 'center', alignItems: 'center',
          justifyContent: 'space-between', flexDirection: 'row', backgroundColor: Theme.TERTIARY, position: 'relative',
        }}>
          <Text style={{ fontSize: 24, fontFamily: 'Poppins-Bold', color: Theme.BACK }}>
            Seus Chats
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          {loading ? (
            <ActivityIndicator size="large" color={Theme.PRIMARY} style={{ marginTop: 32 }} />
          ) : (
            <FlatList
              data={chats}
              keyExtractor={item => String(item.id)}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Theme.PRIMARY]} />
              }
              ListEmptyComponent={
                <Text style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>
                  Nenhum chat encontrado.
                </Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#fff',
                    padding: 16,
                    marginBottom: 1,
                    elevation: 1
                  }}
                  onPress={async () => {
                    const userJson = await AsyncStorage.getItem('user');
                    const user = userJson ? JSON.parse(userJson) : null;
                    navigation.navigate('Chat', {
                      chatId: String(item.id),
                      loggedInUserId: user?.id
                    });
                  }}
                >
                  <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16, padding: 16 }}>
                    {getOngName(item.ongId)}
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
