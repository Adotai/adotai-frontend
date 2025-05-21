import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface DogCardProps {
  name: string;
  image: string;
  location: string;
  onPress?: () => void;
}

export default function DogCard({ name, image, location, onPress }: DogCardProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.image} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.gradient}
      />
      <View style={styles.infoRow}>
        <View style={styles.infoText}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.location}>{location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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