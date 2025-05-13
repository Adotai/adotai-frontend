import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ONGProfileScreen from './ONGProfileScreen';
import ONGAnimalsScreen from './ONGAnimalsScreen';

// Tela fictícia para pessoas interessadas
function InterestedPeopleScreen() {
  return (
    <View style={styles.container}>
      <Text>Pessoas Interessadas</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function ONGHomeScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-circle-outline';
          if (route.name === 'Interessados') iconName = 'people-outline';
          else if (route.name === 'Animais') iconName = 'paw-outline';
          else if (route.name === 'Perfil') iconName = 'person-circle-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#AD334A',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Interessados"
        component={InterestedPeopleScreen}
      />
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
              color="#AD334A"
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