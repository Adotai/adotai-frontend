import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, RefreshControl, Text, Image, Dimensions, StatusBar, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchLoggedUser, fetchOngs } from '../../actions/userActions';
import OngCard from '../../Components/OngCard';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { Picker } from '@react-native-picker/picker';
import { Theme } from '../../../constants/Themes';
import { Feather } from '@expo/vector-icons';


const { width, height } = Dimensions.get('window');


type UserONGScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function UserONGScreen() {
  const [ongs, setOngs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('');
  const navigation = useNavigation<UserONGScreenNavigationProp>();

  const loadOngs = async (state?: string) => {
    try {
      const allOngs = await fetchOngs();
      let filtered = allOngs.filter(ong => ong.status === true);
      if (state) {
        filtered = filtered.filter(ong => ong.address?.state === state);
      }
      setOngs(filtered);
    } catch (e) {
    }
  };


  React.useEffect(() => {
    const init = async () => {
      const user = await fetchLoggedUser();
      if (user?.state && estados.includes(user.state)) {
        setSelectedState(user.state);
      } else {
        setSelectedState('SP');
      }
    };
    init();
  }, []);


  useEffect(() => {
    loadOngs(selectedState);
  }, [selectedState]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOngs(selectedState).finally(() => setRefreshing(false));
  }, [selectedState]);

  return (
    <>
      <StatusBar backgroundColor={Theme.TERTIARY} barStyle="dark-content" />
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Theme.BACK }}>
        <View style={{
          width: '100%', padding: 16, marginTop: 0, alignSelf: 'center', alignItems: 'center',
          justifyContent: 'space-between', flexDirection: 'row', backgroundColor: Theme.TERTIARY, position: 'relative',
          
        }}>
          <Image style={{ alignSelf: 'center', width: width * 0.25, height: height * 0.05, tintColor: Theme.BACK }}
            source={require('../../../assets/images/adotai-text.png')} />
            <View style={{ }}>
            <Picker
              selectedValue={selectedState}
              onValueChange={(itemValue) => setSelectedState(itemValue)}
              style={{ width: 105, color: 'white' }}
            >
              {estados.map((estado) => (
                <Picker.Item key={estado} label={estado} value={estado} />
              ))}
            </Picker>
        </View>
        </View>
       
          
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
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32 }}>Nenhuma ONG encontrada para a região.</Text>}
        />
      </SafeAreaView>
    </>
  );
}