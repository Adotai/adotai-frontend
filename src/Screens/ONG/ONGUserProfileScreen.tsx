import React from 'react';
import { View, Text, ScrollView, StatusBar, Linking, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Theme } from '../../../constants/Themes';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';

export default function ONGUserProfileScreen() {
  const route = useRoute();
  const { user } = (route.params as any) || {};
  const { width, height } = Dimensions.get('window');

  const handleWhatsApp = () => {
    // Tenta pegar o telefone da raiz ou de dentro de um objeto 'address' se existir lá (improvável, mas possível)
    const phoneStr = user?.phone || user?.telephone;
    if (phoneStr) {
      const phone = phoneStr.replace(/\D/g, '');
      const message = `Olá ${user.name}, sou da ONG e gostaria de falar sobre sua solicitação.`;
      Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
    }
  };

  const handleEmail = () => {
      if (user?.email) {
          Linking.openURL(`mailto:${user.email}`);
      }
  }

  if (!user) return null;

  // --- LÓGICA PARA PEGAR O ENDEREÇO ---
  // Tenta pegar da raiz (user.city) OU do objeto aninhado (user.address.city)
  const addressObj = user.address || {};
  const city = user.city || addressObj.city;
  const state = user.state || addressObj.state;
  const street = user.street || addressObj.street;
  const number = user.number || addressObj.number;
  const zipCode = user.zipCode || addressObj.zipCode;

  // Monta o endereço completo para exibição
  const fullAddress = [
    street ? `${street}, ${number || 'S/N'}` : null,
    city && state ? `${city} - ${state}` : null,
    zipCode ? `CEP: ${zipCode}` : null
  ].filter(Boolean).join('\n');
  // ------------------------------------

  return (
    <>
    <StatusBar backgroundColor='transparent' barStyle="dark-content" translucent />
    <ScrollView style={{ flex: 1, backgroundColor: Theme.BACK }}>
      
      <View style={{ width, height: height * 0.35, backgroundColor: Theme.TERTIARY, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="person-circle-outline" size={150} color={Theme.BACK} />
      </View>

      <View style={{ flex: 1 }} >
        <View style={[styles.info, { marginTop: -30 }]}>
          <Text style={styles.name}>{user.name}</Text>
          
          {/* Exibe Cidade/Estado se disponível */}
          {(city || state) && (
            <View style={styles.iconRow}>
                <Ionicons name="location-outline" size={24} color={Theme.PRIMARY} style={{ marginRight: 8 }} />
                <Text style={styles.locationValue}>
                    {city ? city : ''}
                    {city && state ? ' - ' : ''}
                    {state ? state : ''}
                </Text>
            </View>
          )}
        </View>

        {/* Detalhes de Contato */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contato</Text>
          
          {user.email ? (
              <TouchableOpacity onPress={handleEmail} style={styles.contactRow}>
                  <View style={[styles.iconContainer, { backgroundColor: '#e0f2f1' }]}>
                    <Ionicons name="mail" size={20} color={Theme.PRIMARY} />
                  </View>
                  <Text style={styles.contactValue}>{user.email}</Text>
              </TouchableOpacity>
          ) : null}

          {(user.phone || user.telephone) ? (
              <TouchableOpacity onPress={handleWhatsApp} style={styles.contactRow}>
                   <View style={[styles.iconContainer, { backgroundColor: '#e8f5e9' }]}>
                    <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                  </View>
                  <Text style={styles.contactValue}>{user.phone || user.telephone}</Text>
              </TouchableOpacity>
          ) : null}
        </View>

        {/* Endereço Completo (se tiver rua/cep) */}
        {street && (
            <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Endereço Completo</Text>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <Ionicons name="map-outline" size={24} color={'#555'} style={{ marginRight: 12, marginTop: 2 }} />
                <Text style={styles.addressValue}>{fullAddress}</Text>
            </View>
            </View>
        )}

      </View>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  info: {
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: 'flex-start' // Centraliza nome e local
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 2,
  },
  name: {
    fontSize: 24,
    color: Theme.TERTIARY,
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
    textAlign: 'center'
  },
  iconRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  locationValue: {
      fontSize: 16,
      color: '#666',
      fontFamily: 'Poppins-Regular',
  },
  sectionTitle: {
      fontFamily: 'Poppins-Bold',
      fontSize: 18,
      color: Theme.TERTIARY,
      marginBottom: 12
  },
  contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0'
  },
  iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16
  },
  contactValue: {
      fontSize: 16,
      color: '#333',
      fontFamily: 'Poppins-Medium',
      flex: 1
  },
  addressValue: {
      fontSize: 16,
      color: '#555',
      fontFamily: 'Poppins-Regular',
      lineHeight: 24
  }
});