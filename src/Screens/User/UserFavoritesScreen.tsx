import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    StatusBar,
    TouchableOpacity,
    TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { Theme } from '../../../constants/Themes';
import DogCard from '../../Components/DogCard';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { Alert } from 'react-native';
import { fetchAnimalById } from '../../actions/actions'; // Ajuste o caminho se necessário
import { fetchOngs } from '../../actions/userActions'; // Ajuste o caminho se necessário
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Importe os ícones

export default function UserFavoritesScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);

    // 1. Novos estados para o filtro
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'dog' | 'cat'>('all');

    useEffect(() => {
        const getUserId = async () => {
            const userString = await AsyncStorage.getItem('user');
            if (userString) {
                const user = JSON.parse(userString);
                setUserId(user.id);
            } else {
                setLoading(false);
            }
        };
        getUserId();
    }, []);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        const q = query(
            collection(db, 'userLikes'),
            where('userId', '==', userId),
            orderBy('likedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedLikes: any[] = [];
            snapshot.forEach((doc) => {
                fetchedLikes.push({ id: doc.id, ...doc.data() });
            });
            setFavorites(fetchedLikes);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar favoritos:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    // 2. Lógica de filtragem (useMemo)
    const filteredFavorites = useMemo(() => {
        let temp = favorites;

        // Filtro por espécie (depende de você ter salvo 'animalSpecies' no Firestore)
        if (activeFilter === 'dog') {
            temp = temp.filter(item =>
                item.animalSpecies?.toLowerCase() === 'dog' || item.animalSpecies?.toLowerCase() === 'cachorro'
            );
        } else if (activeFilter === 'cat') {
            temp = temp.filter(item =>
                item.animalSpecies?.toLowerCase() === 'cat' || item.animalSpecies?.toLowerCase() === 'gato'
            );
        }

        // Filtro por nome
        if (searchQuery !== '') {
            temp = temp.filter(item =>
                item.animalName?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return temp;
    }, [favorites, searchQuery, activeFilter]);

    const handlePress = async (animalId: number) => {
        try {
            const fullAnimalData = await fetchAnimalById(animalId);
            if (fullAnimalData) {
                // Busque todas as ONGs
                const allOngs = await fetchOngs();
                // Ache a ONG deste animal
                const ongData = allOngs.find((o: { id: any; }) => o.id === fullAnimalData.ongId);

                navigation.navigate('UserAnimalDetails', {
                    animal: fullAnimalData,
                    city: ongData?.address?.city || 'Cidade não disponível',
                    ongName: ongData?.name || 'ONG',
                    ongs: allOngs, // Passe a lista completa!
                    fromOngList: false
                });
            } else {
                Alert.alert("Erro", "Não foi possível carregar os detalhes deste animal.");
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            <StatusBar backgroundColor={Theme.TERTIARY} barStyle="light-content" />
            <SafeAreaView edges={['top']} style={styles.container}>
                {/* 3. Header com botão de filtro */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Meus Favoritos</Text>
                    <TouchableOpacity onPress={() => setIsFilterVisible(!isFilterVisible)}>
                        <MaterialCommunityIcons
                            name={isFilterVisible ? "filter-check" : "filter-menu-outline"}
                            size={28}
                            color={Theme.BACK}
                        />
                    </TouchableOpacity>
                </View>

                {isFilterVisible && (
                    <View style={styles.filterAreaContainer}>
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Buscar nos favoritos..."
                                placeholderTextColor="#888"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={20} color="#888" style={styles.searchIcon} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.filtersRow}>
                            <TouchableOpacity
                                style={activeFilter === 'all' ? styles.activeBarFilter : styles.inactiveBarFilter}
                                onPress={() => setActiveFilter('all')}
                            >
                                <Text style={activeFilter === 'all' ? styles.activeFilterText : styles.inactiveFilterText}>Todos</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={activeFilter === 'cat' ? styles.activeBarFilter : styles.inactiveBarFilter}
                                onPress={() => setActiveFilter('cat')}
                            >
                                <Text style={activeFilter === 'cat' ? styles.activeFilterText : styles.inactiveFilterText}>Gatos</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={activeFilter === 'dog' ? styles.activeBarFilter : styles.inactiveBarFilter}
                                onPress={() => setActiveFilter('dog')}
                            >
                                <Text style={activeFilter === 'dog' ? styles.activeFilterText : styles.inactiveFilterText}>Cachorros</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {loading ? (
                    <ActivityIndicator size="large" color={Theme.PRIMARY} style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={filteredFavorites} // 5. Usa a lista filtrada
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <DogCard
                                name={item.animalName || 'Animal'}
                                image={item.animalPhoto || ''}
                                location="Ver detalhes"
                                status={false}
                                onPress={() => handlePress(item.animalId)}
                            />
                        )}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>
                                {favorites.length === 0
                                    ? "Você ainda não curtiu nenhum animal."
                                    : "Nenhum favorito corresponde à busca."}
                            </Text>
                        }
                    />
                )}
            </SafeAreaView>
        </>
    );
}

// 6. Estilos atualizados (copiados das outras telas)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.BACK,
    },
    header: {
        width: '100%',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'space-between', // Para separar título e ícone
        flexDirection: 'row',
        backgroundColor: Theme.TERTIARY,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: Theme.BACK,
    },
    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 20,
        paddingTop: 10
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 16,
        marginTop: 50,
        fontFamily: 'Poppins-Regular',
    },
    // Estilos dos filtros
    filterAreaContainer: {
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.BACK,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
    },
    filtersRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    activeBarFilter: {
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderWidth: 2,
        borderRadius: 8,
        borderColor: Theme.PRIMARY,
        backgroundColor: Theme.PASTEL,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginHorizontal: 4,
    },
    activeFilterText: {
        fontFamily: "Poppins-SemiBold",
        color: Theme.PRIMARY
    },
    inactiveFilterText: {
        fontFamily: "Poppins-SemiBold",
        color: 'grey'
    },
    inactiveBarFilter: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 2,
        borderRadius: 8,
        borderColor: Theme.INPUT,
        backgroundColor: Theme.BACK,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginHorizontal: 4,
    },
});