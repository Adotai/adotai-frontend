import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../../constants/Themes';
import UserProfileScreen from './UserProfileScreen';
import UserONGScreen from './UserONGScreen';
import UserAnimalsScreen from './UserAnimalsScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

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
              case 'Profile':
                return 'person-circle-outline';
              case 'ONGs':
                return 'globe-outline';
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
      <Tab.Screen name="ONGs" component={UserONGScreen} />
      <Tab.Screen name="Animais" component={UserAnimalsScreen} />
      <Tab.Screen name="Profile" component={UserProfileScreen} />
    </Tab.Navigator>
  );
}

