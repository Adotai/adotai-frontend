import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../../constants/Themes';
import UserProfileScreen from './UserProfileScreen';
import UserONGScreen from './UserONGScreen';
import UserAnimalsScreen from './UserAnimalsScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserChatsScreen from './UserChatsScreen';
import UserFavoritesScreen from './UserFavoritesScreen';

const Tab = createBottomTabNavigator();

export default function UserHomeScreen() {
  return (
    <Tab.Navigator
      initialRouteName="Animais"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const iconName = (() => {
            switch (route.name) {
              case 'Animais':
                return 'paw-outline';
              case 'Perfil':
                return 'person-circle-outline';
              case 'ONGs':
                return 'globe-outline';
              case 'Chats':
                return 'chatbubble-ellipses-outline';
              case 'Favoritos':
                return 'heart-outline';
              default:
                return 'help-circle-outline';
            }
          })();
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerTintColor: 'black',
        tabBarActiveTintColor: Theme.PRIMARY,
        tabBarInactiveTintColor: 'gray',
        tabBarBackgroundColor: Theme.PRIMARY,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 14,
          fontFamily: 'Poppins-SemiBold',
        },
        tabBarStyle: {
          height: 70,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
      })}
    >
      <Tab.Screen name="Chats" component={UserChatsScreen} />
      <Tab.Screen name="ONGs" component={UserONGScreen} />
      <Tab.Screen name="Animais" component={UserAnimalsScreen} />
      <Tab.Screen name="Favoritos" component={UserFavoritesScreen} />
      <Tab.Screen name="Perfil" component={UserProfileScreen} />

    </Tab.Navigator>
  );
}

