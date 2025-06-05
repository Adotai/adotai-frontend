import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../../constants/Themes';
import ChangePasswordModal from '../../Components/CustomModal';
import { fetchLoggedOng, updateOng } from '../../actions/ongActions'; 
import { UpdateOngPayload } from '../../types';


const { height } = Dimensions.get('window');

export default function ONGProfileScreen({ navigation}  : any ) {

    const [ongName, setOngName] = React.useState('');
    const [ongCity, setOngCity] = React.useState('');
    const [ongState, setOngState] = React.useState('');
    const [ongEmail, setOngEmail] = React.useState('');
    const [ongPhone, setOngPhone] = React.useState('');
    const [ongCnpj, setOngCnpj] = React.useState('');
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [ongId, setOngId] = useState<number | null>(null); 

     useEffect(() => {
    const loadONGData = async () => {
      const ongData: {
        id: number;
        name: string;
        phone: string;
        cnpj: string;
        email: string;
        pix: string;
        documents: any;
        address: any; 
        photos: any[]; 
        description: string;
        status: boolean;
      } | null = await fetchLoggedOng();
      if (ongData) {
        setOngId(ongData.id || null);
        setOngName(ongData.name || '');
        setOngCity(ongData.address?.city || '');
        setOngState(ongData.address?.state || '');
        setOngEmail(ongData.email || '');
        setOngPhone(ongData.phone || '');
        setOngCnpj(ongData.cnpj || '');
      }
    };
    loadONGData();
  }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userEmail');
        navigation.reset({
            index: 0,
            routes: [{ name: 'Onboarding' }],
        });
    };

    const handleUpdateONGPassword = async (id: number, newPassword: string) => {
    try {
      const payload: UpdateOngPayload = {
        id: id,
        password: newPassword,
      };
      await updateOng(payload);
    } catch (error: any) {
      throw error;
    }
  };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Image style={{ position: 'absolute', width: '100%', height: '100%' }} source={require('../../../assets/images/background-home.png')} />
            <View style={styles.overlay}>
                <Text style={{ position: 'relative', margin: 32, marginBottom: 0, fontFamily: 'Poppins-SemiBold', color: 'white', fontSize: 32 }}>{ongName}</Text>
                <Text style={{ position: 'relative', margin: 32, marginTop: 0, fontFamily: 'Poppins-Regular', color: Theme.INPUT, fontSize: 16 }}>{ongCity} {ongState}</Text>
                <View style={styles.formContainer}>
                    <TouchableOpacity
                        style={styles.option}
                        onPress={() => navigation.navigate('ONGEditProfile', {
                            name: ongName,
                            city: ongCity,
                            state: ongState,
                            email: ongEmail,
                            phone: ongPhone,
                            cnpj: ongCnpj,
                        })}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons name='business-outline' size={25} color={Theme.PRIMARY} />
                        </View>
                        <Text style={[styles.label]}>Dados da ONG</Text>
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
        onUpdatePassword={handleUpdateONGPassword} 
        entityId={ongId} 
      />
        </SafeAreaView>
    );
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

