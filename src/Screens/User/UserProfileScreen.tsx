import { View, Text, Button, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Theme } from '../../../constants/Themes';
import { Ionicons } from '@expo/vector-icons';
import { fetchLoggedUser, updateUser } from '../../actions/userActions';
import ChangePasswordModal from '../../Components/CustomModal';
import { UpdateUserPayload } from '../../types';
import { doc, updateDoc, deleteField } from "firebase/firestore"; 
import { db } from '../../services/firebaseConfig';

const { width, height } = Dimensions.get('window');


export default function UserProfileScreen({ navigation }: any) {

  const [userName, setUserName] = React.useState<string>('');
  const [userCity, setUserCity] = React.useState<string>('');
  const [userState, setUserState] = React.useState<string>('');
  const [userEmail, setUserEmail] = React.useState<string>('');
  const [userPhone, setUserPhone] = React.useState<string>('');
  const [userCpf, setUserCpf] = React.useState<string>('');
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);


  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await fetchLoggedUser();
      if (userData) {
        setUserId(typeof userData.id === 'number' ? userData.id : null);
        setUserName(userData.name || '');
        setUserCity(userData.city || '');
        setUserState(userData.state || '');
        setUserEmail(userData.email || '');
        setUserPhone(userData.phone || '');
        setUserCpf(userData.cpf || '');
      }
    };
    loadUser();
  }, []);


  const handleLogout = async () => {
    try {
      // Usamos o 'userId' que já está no estado do componente
      if (userId) {
        // console.log(`Limpando token de notificação para o usuário ${userId}...`);
        
        // Acessa o documento do usuário no Firestore
        const userDocRef = doc(db, 'users', String(userId));
        
        // Remove o campo do token de notificação
        await updateDoc(userDocRef, {
          expoPushToken: deleteField() 
        });

        // console.log("Token de notificação limpo com sucesso do Firestore.");
      }

      // Limpa os dados locais da sessão
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('user'); // Adicionado para limpeza completa
      await AsyncStorage.removeItem('userRole'); // Adicionado para limpeza completa

      // Navega o usuário para a tela de Onboarding/Login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    } catch (error) {
      console.error("Erro durante o processo de logout:", error);
      // Como fallback em caso de erro, limpa tudo e desloga mesmo assim
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    }
  };

  const handleUpdateUserPassword = async (id: number, newPassword: string) => {
    try {
      const payload: UpdateUserPayload = {
        id: id,
        password: newPassword,
      };
      await updateUser(payload);
    } catch (error: any) {
      throw error;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Image style={{ position: 'absolute', width: '100%', height: '100%' }} source={require('../../../assets/images/background-home.png')} />
      <View style={styles.overlay}>
        <Text style={{ position: 'relative', margin: 32, marginBottom: 0, fontFamily: 'Poppins-SemiBold', color: 'white', fontSize: 32 }}>{userName}</Text>
        <Text style={{ position: 'relative', margin: 32, marginTop: 0, fontFamily: 'Poppins-Regular', color: Theme.INPUT, fontSize: 16 }}>{userCity} {userState}</Text>
        <View style={styles.formContainer}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate('UserEditProfile', {
              name: userName,
              city: userCity,
              state: userState,
              email: userEmail,
              phone: userPhone,
              cpf: userCpf,
            })}
          >
            <View style={styles.iconContainer}>
              <Ionicons name='person-outline' size={25} color={Theme.PRIMARY} />
            </View>
            <Text style={[styles.label]}>Dados pessoais</Text>
            <Ionicons name="chevron-forward" size={20} color={Theme.PRIMARY} style={styles.chevron} />
          </TouchableOpacity>

          {/* NOVA OPÇÃO: Minhas adoções */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate('UserAdoptions')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name='paw-outline' size={25} color={Theme.PRIMARY} />
            </View>
            <Text style={[styles.label]}>Minhas adoções</Text>
            <Ionicons name="chevron-forward" size={20} color={Theme.PRIMARY} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={() => {setIsPasswordModalVisible(true)}}>
            <View style={styles.iconContainer}>
              <Ionicons name='lock-closed-outline' size={25} color={Theme.PRIMARY} />
            </View>
            <Text style={[styles.label]}>Alterar senha</Text>
            <Ionicons name="chevron-forward" size={20} color={Theme.PRIMARY} style={styles.chevron} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.option, { borderBottomWidth: 0, marginBottom: height * 0.15 }]} onPress={handleLogout}>
            <View style={styles.iconContainer}>
              <Ionicons name='exit-outline' size={25} color={Theme.PRIMARY} />
            </View>
            <Text style={[styles.label, { color: Theme.PRIMARY }]}>Sair do aplicativo</Text>
          </TouchableOpacity>
        </View>
      </View>
        <ChangePasswordModal
        isVisible={isPasswordModalVisible}
        onClose={() => setIsPasswordModalVisible(false)}
        onUpdatePassword={handleUpdateUserPassword}
        entityId={userId} 
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    width: '100%',
    bottom: 0,
    position: 'absolute',
    justifyContent: 'flex-end',
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'white',
    alignItems: 'center',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    paddingBottom: 24,
    paddingTop: 24,
    paddingHorizontal: 16
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  chevron: {
    marginLeft: 8,
  }
});

