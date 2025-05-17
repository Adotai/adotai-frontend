import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Pressable, Linking, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Theme } from '../../../constants/Themes';
import { acceptOng, deleteOng } from '../../actions/userActions';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ONGInfosScreen({ route, navigation }: any) {
  const { ong } = route.params;
  const { width } = Dimensions.get('window');
  const [current, setCurrent] = useState(0);

  const photos = ong.photos || [];

  const handleNext = () => {
    if (current < photos.length - 1) setCurrent(current + 1);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const handleDownload = async (url: string) => {
    if (url) Linking.openURL(url);
  };

  const handleAccept = () => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja aceitar esta ONG?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceitar',
          style: 'default',
          onPress: async () => {
            const ok = await acceptOng(ong.id);
            if (ok) {
              Alert.alert('ONG aceita!');
              navigation.goBack();
            }
          }
        }
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja recusar esta ONG? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Recusar',
          style: 'destructive',
          onPress: async () => {
            const ok = await deleteOng(ong.id);
            if (ok) {
              Alert.alert('ONG recusada!');
              navigation.goBack();
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ width, height: 300, position: 'relative', alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>
        {photos.length > 0 ? (
          <>
            <Image
              source={{ uri: photos[current]?.photoUrl }}
              style={{ width, height: 300, borderBottomLeftRadius:12, borderBottomRightRadius:12 }}
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
      <Text style={styles.name}>{ong.name}</Text>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.info}>
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
          <View style={styles.row}>
            <Text style={styles.label}>Endereço:</Text>
            <Text style={styles.value}>
              {ong.address.street}, Nº {ong.address.number} - {ong.address.city}/{ong.address.state}, CEP: {ong.address.zipCode}
            </Text>
          </View>
          <Text style={[styles.label, { marginTop: 12 }]}>Documentos:</Text>
          <View style={{ flexDirection: 'column', marginTop: 6}}>
            <TouchableOpacity
              style={styles.docButton}
              onPress={() => handleDownload(ong.documents?.socialStatute)}
            >
              <Ionicons name="download-outline" size={22} color={Theme.PRIMARY} style={{ marginRight: 8 }} />
              <Text style={styles.docButtonText}>Estatuto Social</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.docButton}
              onPress={() => handleDownload(ong.documents?.boardMeeting)}
            >
              <Ionicons name="download-outline" size={22} color={Theme.PRIMARY} style={{ marginRight: 8 }} />
              <Text style={styles.docButtonText}>Ata de Reunião</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <View style={styles.fixedButtons}>
      <TouchableOpacity style={styles.rejectButton} onPress={handleDelete}>
          <Text style={styles.rejectText}>Recusar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Text style={styles.acceptText}>Aceitar</Text>
        </TouchableOpacity>
        
      </View>
    </View>
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
    padding: 16,
  },
  name: {
    fontSize: 22,
    color: Theme.PRIMARY,
    padding: 8,
    paddingBottom: 0,
    paddingLeft: 16,
    fontFamily: 'Poppins-Bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderBottomWidth: 1,
    borderColor: Theme.INPUT,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginRight: 4,
    fontFamily: 'Poppins-Bold',
  },
  value: {
    fontSize: 16,
    color: '#555',
    flexShrink: 1,
    fontFamily: 'Poppins-Regular',
  },
  docButton: {
    backgroundColor: Theme.SECONDARY,
    height: 50,
    width: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: Theme.PRIMARY,
    flexDirection: 'row', // <-- adicione isso
    gap: 6, // opcional, para espaçamento entre ícone e texto
  },
  docButtonText: {
    color: Theme.PRIMARY,
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  fixedButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    gap: 12,
    borderTopWidth: 1,
    borderColor: Theme.INPUT,
  },
  acceptButton: {
    backgroundColor: '#D5EBD6',
    borderColor: '#33AD37',
    borderWidth: 2,
    width: '50%',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptText: {
    color: '#33AD37',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  rejectButton: {
    borderColor: Theme.PRIMARY,
    borderWidth: 2,
    width: '50%',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectText: {
    color: Theme.PRIMARY,
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
});