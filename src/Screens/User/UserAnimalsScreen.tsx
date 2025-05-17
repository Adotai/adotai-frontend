import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const mockAnimals = [
  {
    id: 1,
    name: 'Carlos',
    breed: 'Corgi',
    age: '2 anos',
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
    location: 'Campinas/SP',
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
];

export default function UserAnimalsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Image style={{ width: width * 0.5, height: height*0.05, marginVertical: 16 }} source={require('../../../assets/images/adotai-text.png')} />
      <ScrollView contentContainerStyle={styles.listContainer}>
        {mockAnimals.map(animal => (
          <TouchableOpacity key={animal.id} style={styles.card} activeOpacity={0.8}>
            <Image source={{ uri: animal.image }} style={styles.image} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.gradient}
            />
            <View style={styles.infoRow}>
              <View style={styles.infoText}>
                <Text style={styles.name}>{animal.name}</Text>
                <Text style={styles.location}>{animal.location}</Text>
              </View>
              <TouchableOpacity>
              <Ionicons name="heart-outline" size={32} color="#fff" style={styles.heartIcon} />
              </TouchableOpacity>
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