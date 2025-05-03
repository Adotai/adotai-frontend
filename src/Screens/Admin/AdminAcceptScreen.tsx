import { Alert, StyleSheet, Text, View, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { acceptOng, deleteOng, fetchOngs } from '../../actions/userActions';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import OngCard from '../../Components/OngCard';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HeaderStyleInterpolators } from '@react-navigation/stack';

export default function AdminAcceptScreen() {
  const [ongs, setOngs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const loadOngs = async () => {
    try {
      const data = await fetchOngs();
      setOngs(data.filter(ong => ong.status === false));
    } catch (error) {
      // já está sendo tratado no fetchOngs
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOngs();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOngs();
  }, []);

  const handleOngPress = (ong: any) => {
    navigation.navigate('ONGInfos', { ong });
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Onboarding' }],
    });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'ONGs Pendentes',
      headerTitleStyle: {
        fontFamily: 'Poppins-Bold',
        fontSize: 20,
      },
      headerRight: () => (
        <TouchableOpacity onPress={() => setMenuVisible(v => !v)} style={{ padding: 8 }}>
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      ),
      
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {menuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity onPress={handleLogout} style={styles.menuItem}>
            <Ionicons name="log-out-outline" size={20} color="#D22F2F" style={{ marginRight: 8 }} />
            <Text style={{ color: '#D22F2F',  ...styles.menuText }}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
      {loading ? (
        <Text>Carregando...</Text>
      ) : (
        <FlatList
          data={ongs}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <OngCard
              ong={item}
              onPress={() => handleOngPress(item)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  menu: {
    position: 'absolute',
    top: 12,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    zIndex: 10,
    padding: 8,
    minWidth: 120,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    fontFamily: 'Poppins-Bold',
  },
  ongItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
    fontFamily: 'Poppins-Regular',
  },
  ongName: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  ongEmail: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Poppins-Regular',
  },
  menuText: {
    fontFamily: 'Poppins-Bold',
  },
});