import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { fetchAnimals } from '../../actions/userActions';
import DogCard from '../../Components/DogCard';

export default function ONGAnimalsScreen() {
  const [animals, setAnimals] = React.useState<any[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = async () => {
    const data = await fetchAnimals();
    setAnimals(data);
  };

  React.useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={animals}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <DogCard
            name={item.name}
            image={item.photos && item.photos.length > 0 ? item.photos[0].photoUrl : ''}
            location={item.species || ''}
            onPress={() => {}}
          />
        )}
        ListEmptyComponent={<Text>Nenhum animal encontrado.</Text>}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
});