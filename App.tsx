import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from './src/Screens/OnboardingScreen';
import SignInScreen from './src/Screens/SignInScreen';
import UserSignUpScreen from './src/Screens/User/UserSignUpScreen';
import ONGSignUpScreen from './src/Screens/ONG/ONGSignUpScreen';
import { Theme } from './constants/Themes';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded, error] = useFonts({
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Thin': require('./assets/fonts/Poppins-Thin.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Fontes estão carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
    <NavigationContainer>
      <StatusBar hidden={false} translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        <Stack.Navigator initialRouteName="Onboarding">
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="UserSignUp"
            component={UserSignUpScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ONGSignUp"
            component={ONGSignUpScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
 },
});
