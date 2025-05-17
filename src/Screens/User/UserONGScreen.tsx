import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, RefreshControl, Text, Image, Dimensions} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchOngs } from '../../actions/userActions';
import OngCard from '../../Components/OngCard';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

const { width, height } = Dimensions.get('window');


type UserONGScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function UserONGScreen() {
  const [ongs, setOngs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<UserONGScreenNavigationProp>();

  const loadOngs = async () => {
    try {
      const allOngs = await fetchOngs();
      setOngs(allOngs.filter(ong => ong.status === true));
    } catch (e) {
      // Trate o erro se quiser
    }
  };

  useEffect(() => {
    loadOngs();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOngs().finally(() => setRefreshing(false));
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: 10}}>
      <Image style={{ width: width * 0.5, height: height*0.05, marginVertical: 16 }} source={require('../../../assets/images/adotai-text.png')} />
      
      <FlatList
        data={ongs}
        keyExtractor={ong => ong.id?.toString() || Math.random().toString()}
        renderItem={({ item: ong }) => (
          <OngCard ong={ong} onPress={() => navigation.navigate('UserONGDetail', { ong })} />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

