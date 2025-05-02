import { Alert, StyleSheet, Text, View, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { acceptOng, deleteOng, fetchOngs } from '../../actions/userActions';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import OngCard from '../../Components/OngCard';

export default function AdminAcceptScreen() {
  const [ongs, setOngs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const loadOngs = async () => {
    try {
      const data = await fetchOngs();
      setOngs(data.filter(ong => ong.status === false));
    } catch (error) {
      // já está sendo tratado no fetchOngs
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOngs();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOngs();
  }, []);

  const handleOngPress = (ong: any) => {
    navigation.navigate('ONGInfos', { ong });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AdminAcceptScreen</Text>
      {loading ? (
        <Text>Carregando...</Text>
      ) : (
        <FlatList
          data={ongs}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <OngCard
              ong={item}
              onPress={() => handleOngPress(item)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  ongItem: { marginBottom: 12, padding: 12, backgroundColor: '#eee', borderRadius: 8 },
  ongName: { fontSize: 16, fontWeight: 'bold' },
  ongEmail: { fontSize: 14, color: '#555' },
});