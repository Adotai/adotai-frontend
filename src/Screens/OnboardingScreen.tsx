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
      {/* Deixa o conteúdo entrar atrás da status bar */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <Image style={styles.background} source={require('../../assets/background-home.png')} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Image style={styles.logo} source={require('../../assets/adotai-logo-png.png')} />

        <Text style={styles.text}>Juntos podemos dar uma nova chance aos animais.</Text>

        <Text style={styles.text2}>Já possui cadastro?</Text>
        <CustomButton
          title="ENTRAR"
          color={Theme.SECONDARY}
          textColor={Theme.PRIMARY}
          onPress={() => navigation.navigate('SignIn')}
          borderColor="transparent"
        />

        <Text style={styles.text2}>Ainda não é um adotante?</Text>
        <CustomButton
          title="CADASTRAR"
          color={Theme.TERTIARY}
          textColor={Theme.SECONDARY}
          onPress={() => navigation.navigate('UserSignUp')}
          borderColor="transparent"
        />

        <Text style={styles.text2}>É uma ONG interessada?</Text>
        <CustomButton
          title="CADASTRO DE ONG"
          color="transparent"
          textColor={Theme.SECONDARY}
          onPress={() => navigation.navigate('ONGSignUp')}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.PRIMARY,
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logo: {
    height: height * 0.3,
    width: width * 0.6,
    marginBottom: 20,
  },
  text: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Theme.SECONDARY,
    textAlign: 'center',
    marginTop: 20,
  },
  text2: {
    fontFamily: 'Poppins-Bold',
    color: Theme.SECONDARY,
    fontSize: 16,
    paddingVertical: 10,
    textAlign: 'center',
  },
});

export default OnboardingScreen;
