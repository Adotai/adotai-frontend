import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const mockONGs = [
  {
    id: 1,
    name: 'ONG Patinhas Felizes',
    description: 'Ajudamos animais de rua a encontrar um lar.',
    image: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2',
    location: 'São Paulo, SP',
  },
  {
    id: 2,
    name: 'Amigos dos Animais',
    description: 'Resgate e adoção de cães e gatos.',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
    location: 'Campinas, SP',
  },
  {
    id: 3,
    name: 'Projeto Vida Animal',
    description: 'Cuidado e proteção animal.',
    image: 'https://images.unsplash.com/photo-1518715308788-3005759c61d4',
    location: 'Ribeirão Preto, SP',
  },
  // ...adicione mais ONGs mockadas se quiser
];

export default function UserONGScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>ONGs de proteção animal</Text>
      <ScrollView contentContainerStyle={styles.listContainer}>
        {mockONGs.map(ong => (
          <TouchableOpacity key={ong.id} style={styles.card} activeOpacity={0.8}>
            <Image source={{ uri: ong.image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{ong.name}</Text>
              <Text style={styles.description}>{ong.description}</Text>
              <Text style={styles.location}>{ong.location}</Text>
            </View>
          </TouchableOpacity>
        ))}
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
    fontWeight: 'bold',
    marginVertical: 16,
    marginLeft: 8,
    color: '#222',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 14,
    overflow: 'hidden',
    height: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: 110,
    height: '100%',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: '#eee',
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  description: {
    fontSize: 15,
    color: '#666',
    marginTop: 2,
  },
  location: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 6,
  },
});

