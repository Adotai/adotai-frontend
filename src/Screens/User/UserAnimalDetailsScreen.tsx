import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Pressable, ScrollView } from 'react-native';
import { Theme } from '../../../constants/Themes';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function UserAnimalDetailsScreen({ route }: any) {
  const { animal, city } = route.params;
  const { width } = Dimensions.get('window');
  const [current, setCurrent] = useState(0);

  const photos = animal.photos || [];

  const handleNext = () => {
    if (current < photos.length - 1) setCurrent(current + 1);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ width, height: 300, position: 'relative', alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>
        {photos.length > 0 ? (
          <>
            <Image
              source={{ uri: photos[current]?.photoUrl }}
              style={{ width, height: 300, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}
            />
            <Pressable
              style={{ position: 'absolute', left: 0, top: 0, width: width / 2, height: 300 }}
              onPress={handlePrev}
            />
            <Pressable
              style={{ position: 'absolute', right: 0, top: 0, width: width / 2, height: 300 }}
              onPress={handleNext}
            />
            <View style={[styles.progressBarContainer, { position: 'absolute', bottom: 12, left: 0, right: 0 }]}>
              {photos.map((_: any, idx: number) => (
                <View
                  key={idx}
                  style={[
                    styles.progressBar,
                    idx === current
                      ? styles.progressBarActive
                      : styles.progressBarInactive,
                  ]}
                />
              ))}
            </View>
          </>
        ) : (
          <View style={{ backgroundColor: Theme.INPUT, width: '100%', height: 300, justifyContent: 'center', alignItems: 'center', borderRadius: 12 }}>
            <Text style={{ color: '#888', fontSize: 18 }}>Nenhuma foto disponível</Text>
          </View>
        )}
      </View>
      <View style={{ flex: 1, backgroundColor: Theme.CARD}} >

        <View style={[styles.info, { marginTop: 8 }]}>
          <Text style={styles.name}>{animal.name}</Text>
          <View style={[{ flexDirection: 'row', padding: 16, paddingBottom: 0, paddingTop: 0}]}>  
            <Ionicons name="paw-outline" size={24} color={'#555'}  />
            <Text style={[styles.value, { marginLeft: 8 }]}>{animal.species}</Text>
            <Text style={styles.value}> - </Text>
            <Text style={styles.value}>{animal.breed}</Text>
          </View>
          <View style={[{ paddingLeft: 16, flexDirection:'row'}]}>
           <Ionicons
              name={animal.gender === 'male' ? 'male' : 'female'}
              size={24}
              color={'#555'}
            />
            <Text style={[styles.value, { marginLeft: 8 }]}>{animal.gender === 'male' ? 'Macho' : 'Fêmea'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingBottom: 16 }}>
            <Ionicons name="location-outline" size={24} color={'#555'} style={{ marginRight: 8 }} />
            <Text style={[styles.value]}>{city}</Text>
          </View>
        </View>

        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={styles.label}>Cor:</Text>
            <Text style={styles.value}>{animal.color}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Idade:</Text>
            <Text style={styles.value}>{animal.age} anos</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Saúde:</Text>
            <Text style={styles.value}>{animal.health}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Vacinado:</Text>
            <Text style={styles.value}>{animal.vaccinated ? 'Sim' : 'Não'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Castrado:</Text>
            <Text style={styles.value}>{animal.neutered ? 'Sim' : 'Não'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Vermifugado:</Text>
            <Text style={styles.value}>{animal.dewormed ? 'Sim' : 'Não'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Temperamento:</Text>
            <Text style={styles.value}>{animal.temperament}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  progressBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 8,
  },
  progressBar: {
    height: 7,
    borderRadius: 3,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: Theme.INPUT,
    width: 60,
  },
  progressBarActive: {
    backgroundColor: Theme.INPUT,
  },
  progressBarInactive: {
    backgroundColor: 'transparent',
  },
  info: {
    margin: 8,
    marginTop: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 4 },
  },
  name: {
    fontSize: 22,
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
    padding: 16,
    paddingBottom: 0,

  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderColor: Theme.INPUT,
    paddingLeft: 16
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginRight: 4,
    fontFamily: 'Poppins-Bold',
  },
  value: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Poppins-Regular',
  },
});