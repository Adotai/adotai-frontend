import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, SafeAreaView, Touchable, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import OnboardingScreen from './src/Screens/OnboardingScreen';
import SignInScreen from './src/Screens/LoginScreen';
import UserSignUpScreen from './src/Screens/User/UserSignUpScreen';
import ONGSignUpScreen from './src/Screens/ONG/ONGSignUpScreen';
import UserHomeScreen from './src/Screens/User/UserHomeScreen';
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
import ONGCreateAnimalsScreen from './src/Screens/ONG/ONGCreateAnimalsScreen';
import UserONGDetailScreen from './src/Screens/User/UserONGDetailScreen';
import ONGAnimalDetails from './src/Screens/ONG/ONGAnimalDetails';
import UserAnimalDetailsScreen from './src/Screens/User/UserAnimalDetailsScreen';
import UserEditProfileScreen from './src/Screens/User/UserEditProfileScreen';
import ONGEditProfileScreen from './src/Screens/ONG/ONGEditProfileScreen';
import ONGAnimalEditScreen from './src/Screens/ONG/ONGAnimalEditScreen';
import { RootStackParamList } from './src/types';
import UserAnimalONGScreen from './src/Screens/User/UserAnimalONGScreen';
import UserDonateAnimalScreen from './src/Screens/User/UserDonateAnimalScreen';
import ONGUserAnimalsScreen from './src/Screens/ONG/ONGUserAnimalsScreen';
import ChatScreen from './src/Screens/ChatScreen';
import * as Notifications from 'expo-notifications';
import ONGNotificationsScreen from './src/Screens/ONG/ONGNotificationsScreen';
import ONGUserProfileScreen from './src/Screens/ONG/ONGUserProfileScreen';
import UserFavoritesScreen from './src/Screens/User/UserFavoritesScreen';
import ONGSelectAdopterScreen from './src/Screens/ONG/ONGSelectAdopterScreen';
import UserAdoptionsScreen from './src/Screens/User/UserAdoptionsScreen';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

SplashScreen.preventAutoHideAsync();


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, 
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});



export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [fontsLoaded, error] = useFonts({
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
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

  useEffect(() => {
    const receivedListener = Notifications.addNotificationReceivedListener(notification => {
      //console.log('Notificação Recebida (App Aberto):', notification);
    });
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      //console.log('Notificação Clicada:', response);
      const chatId = response.notification.request.content.data.chatId;
      if (chatId) {
        // Exemplo: navigation.navigate('Chat', { chatId: chatId, ... });
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(receivedListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  if (!fontsLoaded && !error) return null;

  let initialRoute = "Onboarding";
  if (isAuthenticated) {
    if (userRole === "admin") initialRoute = "AdminScreen";
    else if (userRole === "ong") initialRoute = "ONGHome";
    else initialRoute = "UserHome";
  }



  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar hidden={false} backgroundColor="white" />
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
              name="UserEditProfile"
              component={UserEditProfileScreen}
              options={{
                headerShown: true,
                headerTitle: 'Editar informações',
                headerTintColor: '#AD334A',
                headerTitleAlign: 'center',
                headerTransparent: false,
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
                headerShown: false,
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: '#FFFFFF',
              }}
            />
            <Stack.Screen
              name="CreateAnimal"
              component={ONGCreateAnimalsScreen}
              options={{
                headerShown: true,
                headerTitle: 'Cadastrar Animal',
                headerTintColor: '#AD334A',
                headerTitleAlign: 'center',
                headerTransparent: false,
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
            <Stack.Screen
              name="UserONGDetail"
              component={UserONGDetailScreen}
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: '#FFFFFF',
              }}
            />

            <Stack.Screen
              name="ONGAnimalDetails"
              component={ONGAnimalDetails}
              options={({ navigation, route }) => {
                // Cast para o tipo correto:
                const params = route.params as RootStackParamList['ONGAnimalDetails'];
                return {
                  headerShown: true,
                  headerTransparent: true,
                  headerTitle: '',
                  headerTintColor: '#FFFFFF',
                  headerRight: () => (
                    params.animal.solicitationStatus === false ? (
                      <TouchableOpacity onPress={() => {
                        navigation.navigate('ONGAnimalEdit', { animal: params.animal });
                      }}>
                        <Ionicons
                          name="pencil"
                          size={24}
                          color="#FFFFFF"
                          style={{ marginRight: 16 }}
                        />
                      </TouchableOpacity>
                    ) : null
                  ),
                };
              }}
            />
            <Stack.Screen
              name="UserAnimalDetails"
              component={UserAnimalDetailsScreen}
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: '#FFFFFF',
              }}
            />
            <Stack.Screen
              name="ONGEditProfile"
              component={ONGEditProfileScreen}
              options={{
                headerShown: true,
                headerTransparent: false,
                headerTitle: 'Editar Perfil',
                headerTintColor: Theme.PRIMARY,
              }}
            />
            <Stack.Screen
              name="ONGAnimalEdit"
              component={ONGAnimalEditScreen}
              options={{
                headerShown: true,
                headerTransparent: false,
                headerTitle: 'Editar Animal',
                headerTintColor: Theme.PRIMARY,
              }}
            />
            <Stack.Screen
              name="UserAnimalONG"
              component={UserAnimalONGScreen}
              options={{
                headerShown: true,
                headerTransparent: false,
                headerTitle: 'Animais da ONG',
                headerTintColor: Theme.TERTIARY,
              }}
            />
            <Stack.Screen
              name="UserDonateAnimal"
              component={UserDonateAnimalScreen}
              options={{
                headerShown: true,
                headerTransparent: false,
                headerTitle: 'Doar Animal',
                headerTintColor: Theme.TERTIARY,
              }}
            />
            <Stack.Screen
              name="ONGUserAnimals"
              component={ONGUserAnimalsScreen}
              options={{
                headerShown: false,
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: '#FFFFFF',
              }}
            />
            <Stack.Screen
              name="ONGNotifications"
              component={ONGNotificationsScreen}
              options={{
                headerShown: false,
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: '#FFFFFF',
              }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                headerShown: true,
                headerTitle: 'Chat',
                headerTintColor: Theme.PRIMARY,
                headerTransparent: false,
              }}
            />

            <Stack.Screen
              name="ONGUserProfile"
              component={ONGUserProfileScreen}
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: '#FFFFFF',
              }}
            />
            <Stack.Screen
              name="UserFavorites"
              component={UserFavoritesScreen}
              options={{ headerShown: false }} 
            />
            <Stack.Screen
              name="SelectAdopter"
              component={ONGSelectAdopterScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
             name="UserAdoptions"
             component={UserAdoptionsScreen}
             options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: '#FFFFFF',
             }}
           >
              
            </Stack.Screen>
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
