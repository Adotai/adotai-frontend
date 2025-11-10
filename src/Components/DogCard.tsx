import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/Themes';

const { width, height } = Dimensions.get('window');

interface DogCardProps {
  name: string;
  image: string;
  location: string;
  onPress?: () => void;
  status: boolean;
   canEdit?: boolean;
   statusText?: string;
}

export default function DogCard({ name, image, location, onPress, status, canEdit = false, statusText }: DogCardProps) {

  const showOverlay = status || !!statusText;

  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.8} 
      onPress={onPress} 
      disabled={status && !canEdit}
    >
      <Image source={{ uri: image }} style={[styles.image]} resizeMode="cover"/>
      
      {showOverlay && (
        <View style={styles.grayscaleOverlay} pointerEvents="none" />
      )}

      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
        style={styles.gradient}
      />

      <View style={styles.infoRow}>
        <View style={styles.infoText}>

          {statusText ? (
            <View style = {styles.statusBadge}>
              <Text style={styles.adoptedText}>{statusText}</Text>
            </View>
          ) : status ? (
            <View style = {styles.statusBadge}>
              <Text style={styles.adoptedText}>Adotado</Text>
            </View>
          ) : null} 
          
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.location}>{location}</Text>
          
        </View>
     
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  grayscaleOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: '#888',
    opacity: 0.75,
  
  },
  statusBadge: {
    backgroundColor: Theme.PASTEL,
    borderRadius: 6,
    paddingVertical: 2, 
    paddingHorizontal: 10, 
    alignItems: 'center',
    alignSelf: 'flex-start', 
    marginBottom: 4, 
  },
  adoptedText: {
    color: Theme.PRIMARY,
    fontSize: 14, 
    fontFamily: 'Poppins-SemiBold',
  },
  card: {
    flexDirection: 'column',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 14,
    height: height * 0.258,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    position: 'relative',
    marginTop: 8,

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