import { View, Text, Button, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Theme } from '../../../constants/Themes';
import { Ionicons } from '@expo/vector-icons';
import { fetchLoggedUser } from '../../actions/userActions';

const { width, height } = Dimensions.get('window');


export default function UserProfileScreen({ navigation }: any) {

  const [userName, setUserName] = React.useState<string>('');
  const [userCity, setUserCity] = React.useState<string>('');
  const [userState, setUserState] = React.useState<string>('');
  const [userEmail, setUserEmail] = React.useState<string>('');
  const [userPhone, setUserPhone] = React.useState<string>('');
  const [userCpf, setUserCpf] = React.useState<string>('');



  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await fetchLoggedUser();
      if (userData) {
        setUserName(userData.name || '');
        setUserCity(userData.city || '');
        setUserState(userData.state || '');
        setUserEmail(userData.email || 'fudeu');
        setUserPhone(userData.phone || 'fudeu');
        setUserCpf(userData.cpf || 'fudeu');
      }
    };
    loadUser();
  }, []);


  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userEmail');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Onboarding' }],
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Image style={{ position: 'absolute', width: '100%', height: '100%' }} source={require('../../../assets/images/background-home.png')} />
      <View style={styles.overlay}>
        <Text style={{ position: 'relative', margin: 32, marginBottom: 0, fontFamily: 'Poppins-SemiBold', color: 'white', fontSize: 32 }}>{userName}</Text>
        <Text style={{ position: 'relative', margin: 32, marginTop: 0, fontFamily: 'Poppins-Regular', color: Theme.INPUT, fontSize: 16 }}>{userCity}, {userState}</Text>
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
          >            <View style={styles.iconContainer}>
              <Ionicons name='person-outline' size={25} color={Theme.PRIMARY} />
            </View>
            <Text style={[styles.label]}>Dados pessoais</Text>
            <Ionicons name="chevron-forward" size={20} color={Theme.PRIMARY} style={styles.chevron} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => { }}>
            <View style={styles.iconContainer}>
              <Ionicons name='trash-outline' size={25} color={Theme.PRIMARY} />
            </View>
            <Text style={[styles.label]}>Excluir minha conta</Text>
            <Ionicons name="chevron-forward" size={20} color={Theme.PRIMARY} style={styles.chevron} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => { }}>
            <View style={styles.iconContainer}>
              <Ionicons name='lock-closed-outline' size={25} color={Theme.PRIMARY} />
            </View>
            <Text style={[styles.label]}>Alterar senha</Text>
            <Ionicons name="chevron-forward" size={20} color={Theme.PRIMARY} style={styles.chevron} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => { }}>
            <View style={styles.iconContainer}>
              <Ionicons name='help-circle-outline' size={25} color={Theme.PRIMARY} />
            </View>
            <Text style={[styles.label]}>Ajuda</Text>
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

