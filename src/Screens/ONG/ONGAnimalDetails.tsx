import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import { Theme } from '../../../constants/Themes';

const { width } = Dimensions.get('window');

export default function ONGAnimalDetails({ route }: any) {
  const { animal } = route.params || {};

  if (!animal) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Animal não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{animal.name}</Text>
        {animal.photos && animal.photos.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {animal.photos.map((photo: any, idx: number) => (
              <Image
                key={idx}
                source={{ uri: photo.photoUrl }}
                style={styles.image}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noImageBox}>
            <Text style={styles.noImageText}>Sem fotos</Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.label}>Raça:</Text>
          <Text style={styles.value}>{animal.breed || 'Não informado'}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Idade:</Text>
          <Text style={styles.value}>{animal.age ? `${animal.age} anos` : 'Não informado'}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Espécie:</Text>
          <Text style={styles.value}>{animal.species || 'Não informado'}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Descrição:</Text>
          <Text style={styles.value}>{animal.description || 'Sem descrição.'}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.BACK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Poppins-Bold',
    color: Theme.PRIMARY,
    marginBottom: 16,
    textAlign: 'center',
  },
  imageScroll: {
    marginBottom: 20,
    width: width,
    minHeight: 180,
  },
  image: {
    width: width * 0.7,
    height: 180,
    borderRadius: 12,
    marginRight: 16,
    resizeMode: 'cover',
    backgroundColor: '#eee',
  },
  noImageBox: {
    width: width * 0.7,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  noImageText: {
    color: '#888',
    fontSize: 16,
  },
  infoBox: {
    width: width * 0.85,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    fontFamily: 'Poppins-SemiBold',
    color: Theme.PRIMARY,
    fontSize: 16,
    width: 100,
  },
  value: {
    fontFamily: 'Poppins-Regular',
    color: '#222',
    fontSize: 16,
    flex: 1,
    flexWrap: 'wrap',
  },
  errorText: {
    color: '#d33',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
});