import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ONGProfileScreen from './ONGProfileScreen';
import ONGAnimalsScreen from './ONGAnimalsScreen';
import { Theme } from '../../../constants/Themes';
import ONGUserAnimalsScreen from './ONGUserAnimalsScreen';
import ONGChatsScreen from './ONGChatsScreen';


const Tab = createBottomTabNavigator();

export default function ONGHomeScreen() {
  return (

    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const iconName = (() => {
            switch (route.name) {
              case 'Animais':
                return 'paw-outline';
              case 'Perfil':
                return 'person-circle-outline';
              case 'Solicitações de Usuários':
                return 'person-add-outline';
              case 'Chats':
                return 'chatbubble-ellipses-outline';
              default:
                return 'help-circle-outline';
            }
          })();
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Theme.PRIMARY,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 14,
          fontFamily: 'Poppins-SemiBold',
        },
        tabBarStyle: {
          height: 60,
        },
      })}
    >
      <Tab.Screen name="Chats" component={ONGChatsScreen} />

      <Tab.Screen
        name="Solicitações de Usuários"
        component={ONGUserAnimalsScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: 'Solicitações de Usuários',
          headerTitleAlign: 'center',
        })} />

      <Tab.Screen
        name="Animais"
        component={ONGAnimalsScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: 'Animais',
          headerTitleAlign: 'center',
          headerRight: () => (
            <Ionicons
              name="add-circle-outline"
              size={26}
              color={Theme.PRIMARY}
              style={{ marginRight: 16 }}
              onPress={() => navigation.navigate('CreateAnimal')}
            />
          ),
        })}
      />
      <Tab.Screen
        name="Perfil"
        component={ONGProfileScreen}
      />

    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});