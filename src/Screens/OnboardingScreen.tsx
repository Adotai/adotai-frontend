import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { Theme } from '../../constants/Themes';
import CustomButton from '../Components/CustomButton';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <Image style={styles.background} source={require('../../assets/images/background-home.png')} />
      <Image style={styles.logo} source={require('../../assets/images/adotai-logo-png.png')} />
      <Text style={styles.text}>Juntos podemos dar uma nova chance aos animais.</Text>

      <View style={styles.overlay}>
        <View style={styles.overlay}>
          <View style={styles.formContainer}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View>
              <Text style={styles.text2}>Já é um adotante?</Text>
              <CustomButton
                title="Entrar"
                color={Theme.PRIMARY}
                textColor={Theme.BACK}
                onPress={() => navigation.navigate('SignIn')}
                buttonStyle={{marginBottom: '5%', width: width * 0.85}}
                borderColor="transparent"
              />
            </View>
            <View>
              <Text style={styles.text2}>É novo por aqui?</Text>
              <CustomButton
                title="Cadastrar"
                borderColor='transparent'
                color={Theme.GREY}
                textColor={Theme.PRIMARY}	
                onPress={() => navigation.navigate('UserSignUp')}
                buttonStyle={{marginBottom: '5%', width: width * 0.85}}
                
              />
            </View>
            <View>
              <Text style={styles.text2}>É uma ONG interessada?</Text>
              <CustomButton
                title="Cadastro de ONG"
                color={'transparent'}
                borderColor={Theme.PRIMARY}
                textColor={Theme.PRIMARY}
                buttonStyle={{marginBottom: '5%', width: width * 0.85}}
                onPress={() => navigation.navigate('ONGSignUp')}
              />
            </View>
            </ScrollView>
          </View>
        </View>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.PRIMARY,
    alignItems: 'center',

  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    height: height * 0.2,
    width: width * 0.5,
    marginTop: height * 0.1,
    marginBottom: height * 0.05,
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    padding: 32
  },
  text2: {
    fontFamily: 'Poppins-Regular',
    color: Theme.PRIMARY,
    fontSize: 12,
  },
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
  },
});

export default OnboardingScreen;
