import React from 'react';
import { TouchableOpacity, Image, Text, View, StyleSheet, Pressable } from 'react-native';
import { Theme } from '../../constants/Themes';



export default function OngCard({ ong, onPress }: { ong: any; onPress: () => void }) {
    const firstPhoto = ong.photos?.[0]?.photoUrl;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            {firstPhoto ? (
                <View style={{ width: '30%', height: 120 }}>
                    <Image source={{ uri: firstPhoto }} style={styles.image} />
                </View>
            ) : (
                <View style={styles.placeholder}><Text style={{color: '#888'}}>Sem foto</Text></View>
            )}
            <View style={{marginLeft: '5%',justifyContent: 'center', alignItems: 'flex-start'}}>
                <Text style={styles.name}>{ong.name}</Text>
                <Text style={styles.city}>{ong.address.city}, {ong.address.state}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#f8f8f8',
        elevation: 2,
    },
    image: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    placeholder: {
        width: '30%', 
        height: 120 ,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.INPUT,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12
        
    },
    name: {
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
    },
    city:{
        fontFamily: 'Poppins-SemiBold',
        color: Theme.TERTIARY,
        fontSize: 16,
    }

});