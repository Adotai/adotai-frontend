import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../../constants/Themes';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function ONGProfileScreen({ navigation}  : any ) {

    // Exemplo de dados estáticos, substitua por dados reais da ONG se necessário
    const [ongName, setOngName] = React.useState('');
    const [ongCity, setOngCity] = React.useState('');
    const [ongState, setOngState] = React.useState('');
    const [ongEmail, setOngEmail] = React.useState('');
    const [ongPhone, setOngPhone] = React.useState('');
    const [ongCnpj, setOngCnpj] = React.useState('');

    // Carregue os dados reais da ONG aqui se desejar

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
                    <TouchableOpacity style={styles.option} onPress={() => { }}>
                        <View style={styles.iconContainer}>
                            <Ionicons name='trash-outline' size={25} color={Theme.PRIMARY} />
                        </View>
                        <Text style={[styles.label]}>Excluir ONG</Text>
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

