import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { fetchAnimals } from '../../actions/userActions';

export default function ONGAnimalsScreen() {
  const [animals, setAnimals] = React.useState<any[]>([]);

  React.useEffect(() => {
    const load = async () => {
      const data = await fetchAnimals();
      setAnimals(data);
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={animals}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.species}>{item.species}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>Nenhum animal encontrado.</Text>}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  species: {
    fontSize: 14,
    color: '#000',
  },
});