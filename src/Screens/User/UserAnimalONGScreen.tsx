import { FlatList, View, Text, SafeAreaViewComponent, SafeAreaView } from "react-native";
import DogCard from "../../Components/DogCard";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../types";
import { useEffect, useState } from "react";
import React from 'react'
import { fetchAnimalsByOng } from "../../actions/ongActions";

export default function UserAnimalONG({ route }: any) {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { ong } = route.params;

    const [animals, setAnimals] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadAnimals = async () => {
        setRefreshing(true);
        try {
            const data = await fetchAnimalsByOng(ong.id);
            setAnimals(data);
        } catch {
            setAnimals([]);
        }
        setRefreshing(false);
    };

    useEffect(() => {
        loadAnimals();
    }, []);

    const onRefresh = () => loadAnimals();

    return (
        <SafeAreaView style={{ flex: 1, padding: 16, paddingTop: 8,  backgroundColor: '#fff' }}>
            <FlatList
                data={animals}
                keyExtractor={item => String(item.id)}
                renderItem={({ item }) => (
                    <DogCard
                        name={item.name}
                        image={item.photos && item.photos.length > 0 ? item.photos[0].photoUrl : ''}
                        location={ong.address.city + '/' + ong.address.state}
                        onPress={() => navigation.navigate('UserAnimalDetails',
                            { animal: item, city: ong.address.city, ongName: ong.name, ongs: [ong], fromOngList: true })}
                        status={item.status === false}
                    />
                )}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32 }}>Nenhum animal encontrado para a ONG.</Text>}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        </SafeAreaView>
    );
}


