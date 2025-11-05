import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Pressable, ScrollView, TouchableOpacity, Alert, Linking, StatusBar } from 'react-native';
import { Theme } from '../../../constants/Themes';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';


export default function ONGUserProfileScreen({ route }: any) {

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const { animal, city, ongName, ongs, fromOngList } = route.params;
  const ong = ongs?.find((o: any) => o.name === ongName || o.id === animal.ongId);
  const { width, height } = Dimensions.get('window');
  const [current, setCurrent] = useState(0);

  const photos = animal.photos || [];

  const handleNext = () => {
    if (current < photos.length - 1) setCurrent(current + 1);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  return (
    <>
    <StatusBar backgroundColor='transparent' barStyle="dark-content" />
    <ScrollView style={{ flex: 1 }}>
      <View style={{ width, height: height * 0.55, position: 'relative', alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>
        {photos.length > 0 ? (
          <>
            <Image
              source={{ uri: photos[current]?.photoUrl }}
              style={{ width, height: "100%", }}
            />
            <Pressable
              style={{ position: 'absolute', left: 0, top: 0, width: width / 2, height: '100%' }}
              onPress={handlePrev}
            />
            <Pressable
              style={{ position: 'absolute', right: 0, top: 0, width: width / 2, height: '100%' }}
              onPress={handleNext}
            />
            <View style={[styles.progressBarContainer, { position: 'absolute', bottom: 64, left: 0, right: 0 }]}>
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
          <View style={{ width: '100%', height: height * 0.5, justifyContent: 'center', alignItems: 'center', borderRadius: 12 }}>
            <Text style={{ color: '#888', fontSize: 18 }}>Nenhuma foto disponível</Text>
          </View>
        )}
      </View>
      <View style={{ flex: 1 }} >
        <View style={[styles.info, { marginTop: -50 }]}>
          <Text style={styles.name}>Nome</Text>
          <View style={[{ paddingLeft: 16, paddingBottom: 8, flexDirection: 'row' }]}>
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

        <View style={[styles.info, { paddingLeft: 16, paddingTop: 16, paddingBottom: 16 }]}>
          <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20, color: Theme.TERTIARY }}>Sobre a pessoa Animal</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Idade:</Text>
            <Text style={styles.value}> anos</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Info:</Text>
            <Text style={styles.value}>humano</Text>
          </View>
        </View>
      </View>
    </ScrollView>
    </>
    
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
    borderColor: Theme.INPUT,
    width: 60,
  },
  progressBarActive: {
    backgroundColor: Theme.TERTIARY,
  },
  progressBarInactive: {
    backgroundColor: Theme.BACK,
  },
  info: {
    marginTop: 0,
    margin: 8,
    elevation: 3,
    padding: 8,
    borderRadius: 10,
    backgroundColor: Theme.CARD
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
    padding: 4,
    paddingLeft: 0
  },
  label: {
    fontSize: 14,
    marginRight: 4,
    fontFamily: 'Poppins-SemiBold'
  },
  value: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Poppins-Regular',
  },
});