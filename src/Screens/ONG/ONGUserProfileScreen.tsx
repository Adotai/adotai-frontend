import React, { useState } from 'react';
import { View, Text, ScrollView, StatusBar, Linking, TouchableOpacity, StyleSheet, Dimensions, Image, Pressable } from 'react-native';
import { Theme } from '../../../constants/Themes';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// --- Funções Auxiliares de Formatação ---
const calculateAge = (birthDateString?: string) => {
    if (!birthDateString) return null;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const translateGender = (gender?: string) => {
    switch (gender?.toUpperCase()) {
        case 'MALE': return 'Homem';
        case 'FEMALE': return 'Mulher';
        default: return 'Não informado';
    }
};

const translateHouse = (type?: string, size?: string) => {
    let typeStr = type;
    switch (type?.toLowerCase()) {
        case 'house': typeStr = 'Casa'; break;
        case 'apartment': typeStr = 'Apartamento'; break;
        case 'farm': typeStr = 'Sítio/Chácara'; break;
        case 'other': typeStr = 'Outro'; break;
    }
    let sizeStr = size;
    switch (size?.toLowerCase()) {
        case 'small': sizeStr = 'Pequeno/a'; break;
        case 'medium': sizeStr = 'Médio/a'; break;
        case 'large': sizeStr = 'Grande'; break;
    }
    if (!typeStr && !sizeStr) return 'Não informado';
    return `${typeStr || ''} ${sizeStr ? '(' + sizeStr + ')' : ''}`;
};

export default function ONGUserProfileScreen() {
  const route = useRoute();
  const { user } = (route.params as any) || {};
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (!user) return null;

  const photos = user.photos || [];

  // --- LÓGICA DE ENDEREÇO ---
  const addressObj = user.address || {};
  const city = user.city || addressObj.city;
  const state = user.state || addressObj.state;
  const street = user.street || addressObj.street;
  const number = user.number || addressObj.number;
  const zipCode = user.zipCode || addressObj.zipCode;
  const district = addressObj.district; // Se tiver bairro

  const fullAddress = [
    street ? `${street}, ${number || 'S/N'}` : null,
    district ? district : null,
    city && state ? `${city} - ${state}` : null,
    zipCode ? `CEP: ${zipCode}` : null
  ].filter(Boolean).join('\n');

  // --- Handlers de Contato ---
  const handleWhatsApp = () => {
    const phoneStr = user?.phone || user?.telephone;
    if (phoneStr) {
      const phone = phoneStr.replace(/\D/g, '');
      const message = `Olá ${user.name}, sou da ONG e gostaria de falar sobre sua solicitação.`;
      Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
    }
  };
  const handleEmail = () => { if (user?.email) Linking.openURL(`mailto:${user.email}`); }

  // --- Controles do Carrossel ---
  const handleNextPhoto = () => { if (currentPhotoIndex < photos.length - 1) setCurrentPhotoIndex(currentPhotoIndex + 1); };
  const handlePrevPhoto = () => { if (currentPhotoIndex > 0) setCurrentPhotoIndex(currentPhotoIndex - 1); };

  return (
    <>
    <StatusBar backgroundColor='transparent' barStyle="dark-content" translucent />
    <ScrollView style={{ flex: 1, backgroundColor: Theme.BACK }}>
      
      {/* --- ÁREA DE FOTOS (Igual ao AnimalDetails) --- */}
      <View style={{ width, height: height * 0.50, backgroundColor: Theme.TERTIARY, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          {photos.length > 0 ? (
            <>
                <Image source={{ uri: photos[currentPhotoIndex].photoUrl }} style={{ width , height: '100%' }} resizeMode="cover" />
                {/* Áreas de toque para navegar */}
                <Pressable style={styles.navAreaLeft} onPress={handlePrevPhoto} />
                <Pressable style={styles.navAreaRight} onPress={handleNextPhoto} />
                
                {/* Barras de progresso */}
                <View style={styles.progressBarContainer}>
                    {photos.map((_: any, idx: number) => (
                    <View key={idx} style={[styles.progressBar, idx === currentPhotoIndex ? styles.progressBarActive : styles.progressBarInactive]} />
                    ))}
                </View>
            </>
          ) : (
              // Placeholder se não tiver foto
              <Ionicons name="person-circle-outline" size={180} color={Theme.BACK} />
          )}
      </View>

      <View style={{ flex: 1 }} >
        {/* --- INFO PRINCIPAL --- */}
        <View style={[styles.infoCard, { marginTop: -50 }]}>
          <Text style={styles.name}>{user.name}</Text>
          {(city || state) && (
            <View style={styles.iconRow}>
                <Ionicons name="location-outline" size={20} color={Theme.PRIMARY} style={{ marginRight: 6 }} />
                <Text style={styles.locationValue}>{city ? city : ''}{city && state ? ' - ' : ''}{state ? state : ''}</Text>
            </View>
          )}
        </View>

        {/* --- SOBRE O USUÁRIO (Novos Campos) --- */}
        <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Sobre</Text>
            
            {/* Idade e Gênero na mesma linha */}
            <View style={styles.detailsRow}>
              <Text style={styles.detailLabel}>Gênero:</Text>
              <Text style={styles.detailValue}>{translateGender(user.gender)}</Text>
            </View>

                <View style={styles.detailRowItem}>
                    <Text style={styles.detailLabel}>Moradia:</Text>
                    <Text style={styles.detailValue}>{translateHouse(user.houseType, user.houseSize)}</Text>
                </View>
                <View style={styles.detailRowItem}>
                    <Text style={styles.detailLabel}>Possui quantos animais:</Text>
                    <Text style={styles.detailValue}>{user.animalsQuantity ? `${user.animalsQuantity}` : 'Nenhum informado'}</Text>
                </View>

            {/* Descrição/Bio */}
            {user.description ? (
                <View style={{ }}>
                    <Text style={styles.detailLabel}>Bio:</Text>
                    <Text style={styles.bioText}>{user.description}</Text>
                </View>
            ) : null}
        </View>

        {/* --- CONTATO --- */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contato</Text>
          {user.email && (
              <TouchableOpacity onPress={handleEmail} style={styles.contactRow}>
                  <View style={[styles.iconContainer, { backgroundColor: Theme.PASTEL }]}>
                    <Ionicons name="mail" size={20} color={Theme.PRIMARY} />
                  </View>
                  <Text style={styles.contactValue}>{user.email}</Text>
              </TouchableOpacity>
          )}
          {(user.phone || user.telephone) && (
              <TouchableOpacity onPress={handleWhatsApp} style={styles.contactRow}>
                   <View style={[styles.iconContainer, { backgroundColor: '#e8f5e9' }]}>
                    <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                  </View>
                  <Text style={styles.contactValue}>{user.phone || user.telephone}</Text>
              </TouchableOpacity>
          )}
        </View>

        {/* --- ENDEREÇO COMPLETO --- */}
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
  infoCard: {
    marginTop: 8, marginHorizontal: 16, marginBottom: 16, padding: 20, borderRadius: 20,
    backgroundColor: '#fff', elevation: 4, alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  sectionCard: {
    marginHorizontal: 16, marginBottom: 16, padding: 20, borderRadius: 20,
    backgroundColor: '#fff', elevation: 2,
  },
  name: { fontSize: 26, color: Theme.TERTIARY, fontFamily: 'Poppins-Bold', marginBottom: 4, textAlign: 'center' },
  iconRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  locationValue: { fontSize: 16, color: '#666', fontFamily: 'Poppins-Regular' },
  sectionTitle: { fontFamily: 'Poppins-Bold', fontSize: 18, color: Theme.TERTIARY, marginBottom: 16 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  contactValue: { fontSize: 16, color: '#333', fontFamily: 'Poppins-Medium', flex: 1 },
  addressValue: { fontSize: 16, color: '#555', fontFamily: 'Poppins-Regular', lineHeight: 24 },
  
  // Estilos novos para os detalhes
  detailsRow: { flexDirection: 'row', justifyContent: 'flex-start' },
  detailItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.BACK, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
  detailText: { fontSize: 16, color: '#555', fontFamily: 'Poppins-Medium' },
  detailList: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 16 },
  detailRowItem: { flexDirection: 'row'},
  detailLabel: { fontSize: 15, color: Theme.TERTIARY, fontFamily: 'Poppins-SemiBold' },
  detailValue: { fontSize: 15, color: '#555', fontFamily: 'Poppins-Regular', marginLeft: 8 },
  bioText: { fontSize: 15, color: '#555', fontFamily: 'Poppins-Regular', marginTop: 4, lineHeight: 22 },

  // Estilos do Carrossel
  navAreaLeft: {  position: 'absolute', left: 0, top: 0, width: width / 2, height: '100%' },
  navAreaRight: {  position: 'absolute', right: 0, top: 0, width: width / 2, height: '100%' },
  progressBarContainer: { position: 'absolute', flexDirection: 'row', width: '100%', justifyContent: 'center',  bottom: 64, left: 0, right: 0 },
  progressBar: {  height: 7,
    borderRadius: 3,
    marginHorizontal: 3,
    borderColor: Theme.INPUT,
    width: 60, },
   progressBarActive: {
    backgroundColor: Theme.TERTIARY,
  },
  progressBarInactive: {
    backgroundColor: Theme.BACK,
  },
});