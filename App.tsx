import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import OnboardingScreen from './src/Screens/OnboardingScreen';
import SignInScreen from './src/Screens/LoginScreen';
import UserSignUpScreen from './src/Screens/User/UserSignUpScreen';
import ONGSignUpScreen from './src/Screens/ONG/ONGSignUpScreen';
//import UserHomeScreen from './src/Screens/User/UserHomeScreen'; 
import { Theme } from './constants/Themes';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AddressScreen from './src/Screens/AddressScreen';
import UserProfileScreen from './src/Screens/User/UserProfileScreen';
import UserONGScreen from './src/Screens/User/UserONGScreen';
import UserAnimalsScreen from './src/Screens/User/UserAnimalsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import ONGDetailsScreen from './src/Screens/ONG/ONGDetailsScreen';
import ONGHomeScreen from './src/Screens/ONG/ONGHomeScreen';
import AdminAcceptScreen from './src/Screens/Admin/AdminAcceptScreen';
import ONGInfosScreen from './src/Screens/Admin/ONGlnfosScreen';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

SplashScreen.preventAutoHideAsync();


function UserHomeScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const iconName = (() => {
            switch (route.name) {
              case 'Animais':
                return 'paw-outline';
              case 'Profile':
                return 'person-outline';
              case 'ONGs':
                return 'globe-outline';
              default:
                return 'help-circle-outline';
            }
          })();
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Theme.PRIMARY,
        tabBarInactiveTintColor: 'gray',
        tabBarBackgroundColor: Theme.PRIMARY,
        tabBarLabelStyle: {
          fontSize: 14,
          fontFamily: 'Poppins-Bold',
        },
        tabBarStyle: {
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="ONGs" component={UserONGScreen} />
      <Tab.Screen name="Animais" component={UserAnimalsScreen} />
      <Tab.Screen name="Profile" component={UserProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [fontsLoaded, error] = useFonts({
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Thin': require('./assets/fonts/Poppins-Thin.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
  });

  useEffect(() => {
    const checkTokenAndRole = async () => {
      const token = await AsyncStorage.getItem('authToken');
      const role = await AsyncStorage.getItem('userRole');
      setIsAuthenticated(!!token);
      setUserRole(role);
    };
    checkTokenAndRole();
    if (fontsLoaded || error) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) return null;

  // Defina a tela inicial conforme a role
  let initialRoute = "Onboarding";
  if (isAuthenticated) {
    if (userRole === "admin") initialRoute = "AdminScreen";
    else if (userRole === "ong") initialRoute = "ONGHome";
    else initialRoute = "UserHome";
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar hidden={false} translucent backgroundColor="transparent" />
        <SafeAreaView style={styles.safeArea}>
          <Stack.Navigator initialRouteName={initialRoute}>
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: '#FFFFFF',
              }} />
            <Stack.Screen
              name="SignIn"
              component={SignInScreen}
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: '#FFFFFF',
              }} />
            <Stack.Screen
              name="UserSignUp"
              component={UserSignUpScreen}
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: '#FFFFFF',
              }} />
            <Stack.Screen
              name="ONGSignUp"
              component={ONGSignUpScreen}
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: '#FFFFFF',
              }} />
            <Stack.Screen
              name="UserHome"
              component={UserHomeScreen}
              options={{
                headerShown: false,
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: '#FFFFFF',
              }} />
            <Stack.Screen
              name="UserProfile"
              component={UserProfileScreen}
              options={{
                headerShown: false,
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: '#FFFFFF',
              }} />
            <Stack.Screen
              name="Address"
              component={AddressScreen}
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: '#FFFFFF',
              }} />
            <Stack.Screen
              name="UserONG"
              component={UserONGScreen}
              options={{
                headerShown: true,
                headerTintColor: Theme.PRIMARY,
                headerLeft: () => null,
                gestureEnabled: false,  
              }}
            />
            <Stack.Screen
              name="UserAnimals"
              component={UserAnimalsScreen}
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: '#FFFFFF',
              }}
            />
            <Stack.Screen
              name="ONGDetails"
              component={ONGDetailsScreen}
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: '#FFFFFF',
              }}
            />
            <Stack.Screen
              name="ONGHome"
              component={ONGHomeScreen}
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: '#FFFFFF',
              }}
            />
            <Stack.Screen
              name="AdminScreen"
              component={AdminAcceptScreen}
              options={{
                headerShown: true,
                headerTintColor: Theme.PRIMARY,
                headerLeft: () => null,
                gestureEnabled: false,  
              }}
            />
            <Stack.Screen
              name="ONGInfos"
              component={ONGInfosScreen}
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: '#FFFFFF',
              }}
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
