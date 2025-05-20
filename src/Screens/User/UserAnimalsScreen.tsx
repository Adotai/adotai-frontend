import { StyleSheet, Text, View, Image, ScrollView, SafeAreaView, Dimensions } from 'react-native'
import React from 'react'
import DogCard from '../../Components/DogCard'
import { fetchAnimals, fetchOngs } from '../../actions/userActions'

const { width, height } = Dimensions.get('window');

export default function UserAnimalsScreen() {
  const [animals, setAnimals] = React.useState<any[]>([]);
  const [ongs, setOngs] = React.useState<any[]>([]);

  React.useEffect(() => {
    const load = async () => {
      const [animalsData, ongsData] = await Promise.all([
        fetchAnimals(),
        fetchOngs()
      ]);
      setAnimals(animalsData);
      setOngs(ongsData);
    };
    load();
  }, []);

  // Função para buscar a ONG pelo ongId do animal
  const getOngLocation = (ongId: number) => {
    const ong = ongs.find(o => o.id === ongId);
    if (ong && ong.address) {
      return `${ong.address.city}, ${ong.address.state}`;
    }
    return '';
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image style={{ width: width * 0.5, height: height * 0.05, marginVertical: 16 }} source={require('../../../assets/images/adotai-text.png')} />
      <ScrollView contentContainerStyle={styles.listContainer}>
        {animals.map(animal => (
          <DogCard
            key={animal.id}
            name={animal.name}
            image={animal.photos && animal.photos.length > 0 ? animal.photos[0].photoUrl : ''}
            location={getOngLocation(animal.ongId)}
            onPress={() => {}}
            onLikePress={() => {}}
          />
        ))}
        {animals.length === 0 && (
          <Text style={{ textAlign: 'center', marginTop: 32 }}>Nenhum animal encontrado.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Regular',
    marginVertical: 16,
    marginLeft: 8,
    color: '#222',
  },
  listContainer: {
    paddingBottom: 20,
    
  },
  card: {
    flexDirection: 'column',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 14,
    height: height * 0.258,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  infoRow: {
    position: 'absolute',
    bottom: 18,
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoText: {
    flexDirection: 'column',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  location: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  heartIcon: {
    marginLeft: 12,
  },
});