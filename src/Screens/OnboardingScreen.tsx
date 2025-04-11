import React from 'react';
import { View, Text, Image, StatusBar, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';  // Importe o hook
import { NavigationProp } from '@react-navigation/native'; // Importe a tipagem do NavigationProp
import { RootStackParamList } from '../types';  // Importe o tipo correto
import { Theme } from '../../constants/Themes';
import CustomButton from '../Components/CustomButton';

const OnboardingScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    return (
        <View style={styles.container}>
            <Image style={styles.logo} source={require('../../assets/adotai-logo-png.png')} />
            <Image style={styles.background} source={require('../../assets/background-home.png')} />
            <Text style={styles.text}>Juntos podemos dar uma nova chance aos animais. </Text>
            <Text style={styles.text2}>Já possui cadastro?</Text>
            <CustomButton
                title="ENTRAR"
                color={Theme.SECONDARY}
                textColor={Theme.PRIMARY}
                onPress={() => navigation.navigate('SignIn')}
                borderColor='transparent'
            />
            <Text style={styles.text2}>Ainda não é um adotante?</Text>
            <CustomButton
                title="CADASTRAR"
                color={Theme.TERTIARY}
                textColor={Theme.SECONDARY}
                onPress={() => navigation.navigate('UserSignUp')}
                borderColor='transparent'
            />
            <Text style={styles.text2}>É uma ong interessada?</Text>
            <CustomButton
                title="CADASTRO DE ONG"
                color='transparent'
                textColor={Theme.SECONDARY}
                onPress={() => navigation.navigate('ONGSignUp')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Theme.PRIMARY,
        width: '100%',
    },
    logo: {
        zIndex: 999,
        height: '35%',
    },
    background: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    text: {
        fontFamily: 'Poppins-Bold',
        fontSize: 24,
        color: Theme.SECONDARY,
        paddingHorizontal: 20,
    },
    text2: {
        fontFamily: 'Poppins-Bold',
        color: Theme.SECONDARY,
        fontSize: 16,
        paddingVertical: 10,
    },
});

export default OnboardingScreen;
