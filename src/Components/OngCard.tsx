import React from 'react';
import { TouchableOpacity, Image, Text, View, StyleSheet, Pressable } from 'react-native';
import { Theme } from '../../constants/Themes';



export default function OngCard({ ong, onPress }: { ong: any; onPress: () => void }) {
    const firstPhoto = ong.photos?.[0]?.photoUrl;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            {firstPhoto ? (
                <View style={{ width: '30%', height: 100 }}>
                    <Image source={{ uri: firstPhoto }} style={styles.image} />
                </View>
            ) : (
                <View style={styles.placeholder}><Text style={{color: '#888'}}>Sem foto</Text></View>
            )}
            <Text style={styles.name}>{ong.name}</Text>
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
        backgroundColor: '#eee',
        elevation: 2,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    placeholder: {
        width: '30%', 
        height: 100 ,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.INPUT,
        borderRadius: 10,
        
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        width: '40%',
        marginLeft: '2%'
    },

});