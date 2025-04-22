import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const mockAnimals = [
  {
    id: 1,
    name: 'Thor',
    breed: 'Vira-lata',
    age: '2 anos',
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d', // exemplo
    location: 'São Paulo, SP',
  },
  {
    id: 2,
    name: 'Luna',
    breed: 'Golden Retriever',
    age: '1 ano',
    image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16',
    location: 'Campinas, SP',
  },
  {
    id: 3,
    name: 'Max',
    breed: 'Poodle',
    age: '3 anos',
    image: 'https://images.unsplash.com/photo-1518715308788-3005759c61d4',
    location: 'Ribeirão Preto, SP',
  },
  // ...adicione mais animais mockados se quiser
];

export default function UserAnimalsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Animais para adoção</Text>
      <ScrollView contentContainerStyle={styles.listContainer}>
        {mockAnimals.map(animal => (
          <TouchableOpacity key={animal.id} style={styles.card} activeOpacity={0.8}>
            <Image source={{ uri: animal.image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{animal.name}</Text>
              <Text style={styles.breed}>{animal.breed}</Text>
              <Text style={styles.age}>{animal.age}</Text>
              <Text style={styles.location}>{animal.location}</Text>
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
    height: 120,
    overflow: 'hidden',
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
  breed: {
    fontSize: 15,
    color: '#666',
    marginTop: 2,
  },
  age: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  location: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 6,
  },
});