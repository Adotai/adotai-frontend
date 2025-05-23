import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Pressable, ScrollView } from 'react-native';
import { Theme } from '../../../constants/Themes';
import Ionicons from '@expo/vector-icons/Ionicons';


export default function UserONGDetailScreen({ route }: any) {
  const { ong } = route.params;
  const { width, height } = Dimensions.get('window');
  const [current, setCurrent] = useState(0);

  const photos = ong.photos || [];

  const handleNext = () => {
    if (current < photos.length - 1) setCurrent(current + 1);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ width, height: height * 0.55, position: 'relative', alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>
        {photos.length > 0 ? (
          <>
            <Image
              source={{ uri: photos[current]?.photoUrl }}
              style={{ width, height: '100%' }}
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
          <View style={{ backgroundColor: Theme.INPUT, width: '100%', height: height * 0.5, justifyContent: 'center', alignItems: 'center', borderRadius: 12 }}>
            <Text style={{ color: '#888', fontSize: 18 }}>Nenhuma foto disponível</Text>
          </View>
        )}
      </View>
      <View style={[{ flex: 1 }]}>
        <View style={[styles.info, { marginTop: -50 }]}>
          <Text style={styles.name}>{ong.name}</Text>
          <View style={{ flexDirection: 'row', padding: 16, paddingBottom: 0, paddingTop: 0 }}>
            <Ionicons name="location-outline" size={24} color={'#555'} style={{ marginRight: 8 }} />
            <Text style={styles.value}>{ong.address.city}/{ong.address.state}</Text>
          </View>
          <View style={[styles.row,{flexDirection: 'column'}]}>
            <Text style={styles.label}>Descrição da ONG:</Text>
            <Text style={[styles.value]}>
              {ong.description}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>E-mail:</Text>
            <Text style={styles.value}>{ong.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Telefone:</Text>
            <Text style={styles.value}>{ong.phone}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CNPJ:</Text>
            <Text style={styles.value}>{ong.cnpj}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Pix:</Text>
            <Text style={styles.value}>{ong.pix}</Text>
          </View>
          <View style={[styles.row,{flexDirection: 'column'}]}>
            <Text style={styles.label}>Endereço:</Text>
            <Text style={[styles.value]}>
              {ong.address.street}, Nº {ong.address.number}, CEP: {ong.address.zipCode}
            </Text>
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
    borderColor: Theme.INPUT,
    width: 60,
  },
  progressBarActive: {
    backgroundColor: Theme.PRIMARY,
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
    padding: 16,
    paddingBottom: 0,
    fontFamily: 'Poppins-Bold',
  },
  row: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 0
  },
  label: {
    fontSize: 14,
    marginRight: 4,
    fontFamily: 'Poppins-Bold',
  },
  value: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Poppins-Regular',
  },
});