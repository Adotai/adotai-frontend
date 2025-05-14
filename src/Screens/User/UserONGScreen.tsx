import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, RefreshControl, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchOngs } from '../../actions/userActions';
import OngCard from '../../Components/OngCard';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

type UserONGScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function UserONGScreen() {
  const [ongs, setOngs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<UserONGScreenNavigationProp>();

  const loadOngs = async () => {
    try {
      const allOngs = await fetchOngs();
      setOngs(allOngs.filter(ong => ong.status === true));
    } catch (e) {
      // Trate o erro se quiser
    }
  };

  useEffect(() => {
    loadOngs();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOngs().finally(() => setRefreshing(false));
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: 10 }}>
      <Text style={{
        fontSize: 22,
        fontWeight: 'bold',
        marginVertical: 16,
        marginLeft: 8,
        color: '#222',
        fontFamily: 'Poppins-Bold'
      }}>
        ONGs de proteção animal
      </Text>
      <FlatList
        data={ongs}
        keyExtractor={ong => ong.id?.toString() || Math.random().toString()}
        renderItem={({ item: ong }) => (
          <OngCard ong={ong} onPress={() => navigation.navigate('UserONGDetail', { ong })} />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

