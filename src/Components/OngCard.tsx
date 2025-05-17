import React from 'react';
import { TouchableOpacity, Image, Text, View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Theme } from '../../constants/Themes';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');


export default function OngCard({ ong, onPress }: { ong: any; onPress: () => void }) {
    const firstPhoto = ong.photos?.[0]?.photoUrl;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            {firstPhoto ? (
                    <Image source={{ uri: firstPhoto }} style={styles.image} />
            ) : (
                <View style={styles.placeholder}>
                    <Text style={{color: '#888'}}>Sem foto</Text>
                </View>
            )}
            <View style={{flexDirection: 'row', alignItems: 'center' , justifyContent: 'space-between', width:'100%'}}>
            <View style={{ padding: 16, alignSelf: 'flex-start'}}>
                <Text style={styles.name}>{ong.name}</Text>
                <Text numberOfLines={2} style={styles.description}>dasdadsadasdsadasdasdasdasd{ong.description}</Text>
                <Text style={styles.city}>{ong.address.city}, {ong.address.state}</Text>
            </View>
            <TouchableOpacity style={{ padding: 12 }}>
                <Ionicons name="chevron-forward" size={28} color={Theme.PRIMARY} />
            </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        alignItems: 'center',
        marginBottom: 16,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#f8f8f8',
        elevation: 2,
        width: '100%',
    },
    image: {
        width: '100%',
        height: height * 0.18,
        borderRadius: 10

    },
    placeholder: {
        width: '100%',
        height: height * 0.18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.INPUT,
        borderRadius: 10
        
    },
    name: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
    },
    city:{
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
    },
    description: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: '#888',
        width: width * 0.47,
    },

});