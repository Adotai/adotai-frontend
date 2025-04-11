import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { Theme } from '../../constants/Themes'
import { CustomInput } from '../Components/CustomInput';
import CustomButton from '../Components/CustomButton';

const UserSignUpScreen = () => {
    return (
        <View style={styles.container}>
            <Image
                style={styles.backgroundImage}
                source={require('../../assets/background-home.png')}
            />
            <View style={styles.overlay}>
                <Image
                    style={styles.logo}
                    source={require('../../assets/adotai-logo-png.png')}
                />

                <View style={styles.formContainer}>
                    <Text style={styles.loginText}>Informações pessoais</Text>

                    <CustomInput
                        label="Nome"
                        value={''}
                        onChange={() => { }}
                    />
                    <CustomInput
                        label="E-mail"
                        value={''}
                        onChange={() => { }}
                        secureTextEntry={true}
                    />
                    <CustomInput
                        label="Telefone"
                        value={''}
                        onChange={() => { }}
                        secureTextEntry={true}
                    />
                    <CustomInput
                        label="CPF"
                        value={''}
                        onChange={() => { }}
                        secureTextEntry={true}
                    />
                    <CustomInput
                        label="Senha"
                        value={''}
                        onChange={() => { }}
                        secureTextEntry={true}
                    />
                    <CustomInput
                        label="Confirme sua Senha"
                        value={''}
                        onChange={() => { }}
                        secureTextEntry={true}
                    />



                    <CustomButton
                        title={'SEGUINTE'}
                        borderColor='transparent'
                        textColor={Theme.BACK}
                        color={Theme.TERTIARY}
                        onPress={() => { }}
                        disabled={false}  
                        buttonStyle={{marginTop: 20}}/>
                </View>
            </View>
        </View>
    );
}

export default UserSignUpScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    backgroundImage: {
        width: "100%",
        height: '100%',
        position: 'absolute',
    },
    overlay: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
    },
    logo: {
        height: '18%',
        width: '40%',
    },
    titleBold: {
        fontFamily: 'Poppins-Bold',
        fontSize: 24,
        color: 'white',
        textAlign: 'center',
    },

    formContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: Theme.BACK,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
    },
    loginText: {
        fontSize: 24,
        color: Theme.PRIMARY,
        fontFamily: 'Poppins-Bold',
    },
})