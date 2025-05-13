import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function ONGProfileScreen() {
    const navigation = useNavigation<import('@react-navigation/native').NavigationProp<{ Onboarding: undefined }>>();

    const handleLogout = async () => {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userEmail');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Onboarding' }],
        });
      };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>ONG Profile Screen</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 24,
    },
    logoutButton: {
        marginTop: 24,
        backgroundColor: '#AD334A',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

