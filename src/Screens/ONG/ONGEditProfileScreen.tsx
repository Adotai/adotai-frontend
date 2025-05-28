import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, SafeAreaView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../../../constants/Themes';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import Constants from 'expo-constants';
import { TextInput } from 'react-native-paper';
import CustomButton from '../../Components/CustomButton';
import { deleteOngPhotos, fetchLoggedOng, updateOng } from '../../actions/ongActions';

const { width, height } = Dimensions.get('window');

const inputTheme = {
    colors: {
        primary: Theme.PRIMARY,
        text: '#222',
        placeholder: Theme.PRIMARY,
        background: '#fff',
        outline: '#ccc'
    },
    roundness: 10,
};

export default function ONGEditProfileScreen({ route }: any) {
    const navigation = useNavigation();
    const [ong, setOng] = useState<any>(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [email, setEmail] = useState('');
    const [pix, setPix] = useState('');
    const [description, setDescription] = useState('');
    const [photos, setPhotos] = useState<any[]>([]);
    // Campos de endereço
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');

    useEffect(() => {
        const loadOng = async () => {
            const ongData = await fetchLoggedOng();
            if (ongData) {
                setOng(ongData);
                setName(ongData.name || '');
                setPhone(ongData.phone || '');
                setCnpj(ongData.cnpj || '');
                setDescription(ongData.description || '');
                setPhotos(ongData.photos || []);
                setEmail(ongData.email || '');
                setPix(ongData.pix || '');
                // Endereço
                setStreet(ongData.address?.street || '');
                setNumber(ongData.address?.number ? String(ongData.address.number) : '');
                setCity(ongData.address?.city || '');
                setState(ongData.address?.state || '');
                setZipCode(ongData.address?.zipCode || '');
            }
        };
        loadOng();
    }, []);

    const handlePickImage = async () => {
        if (photos.length >= 3) return;
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.7,
            selectionLimit: 3 - photos.length,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const newImages = [...photos, ...result.assets.map((a: any) => ({ photoUrl: a.uri }))].slice(0, 3);
            setPhotos(newImages);
        }
    };

    const handleRemovePhoto = async (idx: number) => {
        const photo = photos[idx];
        // Se a foto já existe no backend (tem id), remova do backend
        if (photo.id && ong?.id) {
            try {
                await deleteOngPhotos(ong.id, [photo.id]);
                // Remova do estado local também
                setPhotos(photos.filter((_, i) => i !== idx));
            } catch (e: any) {
                Alert.alert('Erro', 'Erro ao remover foto do servidor.');
            }
        } else {
            // Foto só local, basta remover do estado
            setPhotos(photos.filter((_, i) => i !== idx));
        }
    };
    const handleSave = async () => {
        try {
            if (!ong) return;
            const updatedAddress = {
                ...ong.address,
                street,
                number: Number(number),
                city,
                state,
                zipCode,
            };
            const updateDto = {
                id: ong.id,
                name,
                phone,
                cnpj: ong.cnpj,
                email: ong.email,
                password: '',
                photos: photos.map((p: any) => ({
                    id: p.id,
                    photoUrl: p.photoUrl
                })),
                description,
                address: updatedAddress
            };
            await updateOng(updateDto);
            Alert.alert('Sucesso', 'Perfil atualizado!');
            navigation.goBack();
        } catch (e: any) {
            Alert.alert('Erro', e?.response?.data?.message || 'Erro ao atualizar perfil');
        }
    };

    return (
        <SafeAreaView style={{ alignItems: 'center', width: '100%', backgroundColor: '#fff', height: '100%' }}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.label}>Fotos</Text>
                <View style={{ flexDirection: 'row', marginBottom: 16, justifyContent: 'center', alignItems: 'center' }}>
                    {photos.map((img, idx) => (
                        <View key={idx} style={{ margin: 4, alignItems: 'center' }}>
                            <Image source={{ uri: img.photoUrl }} style={{ width: width * 0.25, height: height * 0.20, borderRadius: 8 }} />
                            <TouchableOpacity onPress={() => handleRemovePhoto(idx)}>
                                <Text style={{ color: '#d33', fontSize: 12 }}>Remover</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    {photos.length < 3 && (
                        <TouchableOpacity onPress={handlePickImage} style={styles.addPhotoBtn}>
                            <Text style={{ fontSize: 32, color: '#888' }}>+</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    label="Nome"
                    placeholder="Nome"
                    mode="outlined"
                    theme={inputTheme}
                />
                <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Telefone"
                    label="Telefone"
                    keyboardType="phone-pad"
                    mode="outlined"
                    theme={inputTheme}
                />
                <TextInput
                    style={styles.input}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Descrição"
                    label="Descrição"
                    mode="outlined"
                    theme={inputTheme}
                />
                <TextInput
                    style={styles.input}
                    value={cnpj}
                    onChangeText={setCnpj}
                    placeholder="CNPJ"
                    label="CNPJ"
                    keyboardType="numeric"
                    mode="outlined"
                    theme={inputTheme}
                />
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    label="Email"
                    keyboardType="email-address"
                    mode="outlined"
                    theme={inputTheme}
                />
                <TextInput
                    style={styles.input}
                    value={pix}
                    onChangeText={setPix}
                    placeholder="Pix"
                    label="Pix"
                    keyboardType="default"
                    mode="outlined"
                    theme={inputTheme}
                />

                {/* Campos de endereço */}
                <Text style={styles.label}>Endereço</Text>
                <TextInput
                    style={styles.input}
                    value={street}
                    onChangeText={setStreet}
                    placeholder="Rua"
                    label="Rua"
                    mode="outlined"
                    theme={inputTheme}
                />
                <TextInput
                    style={styles.input}
                    value={number}
                    onChangeText={setNumber}
                    placeholder="Número"
                    label="Número"
                    keyboardType="numeric"
                    mode="outlined"
                    theme={inputTheme}
                />
                <TextInput
                    style={styles.input}
                    value={city}
                    onChangeText={setCity}
                    placeholder="Cidade"
                    label="Cidade"
                    mode="outlined"
                    theme={inputTheme}
                />
                <TextInput
                    style={styles.input}
                    value={state}
                    onChangeText={setState}
                    placeholder="Estado"
                    label="Estado"
                    mode="outlined"
                    theme={inputTheme}
                />
                <TextInput
                    style={styles.input}
                    value={zipCode}
                    onChangeText={setZipCode}
                    placeholder="CEP"
                    label="CEP"
                    keyboardType="numeric"
                    mode="outlined"
                    theme={inputTheme}
                />
            </ScrollView>
            <CustomButton
                title={'Salvar'}
                borderColor="transparent"
                textColor={Theme.BACK}
                color={Theme.PRIMARY}
                onPress={handleSave}
                disabled={false}
                buttonStyle={{ marginBottom: '5%', marginTop: '5%', width: width * .85, alignSelf: 'center' }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: '#fff',
        flexGrow: 1,
        alignItems: 'center'
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 24,
        color: Theme.PRIMARY
    },
    input: {
        marginBottom: 12,
        width: width * .85,
        backgroundColor: '#fff',
        alignSelf: 'center',
        borderRadius: 10,
    },
    label: {
        fontSize: 16,
        color: Theme.PRIMARY,
        marginBottom: 8,
        fontFamily: 'Poppins-SemiBold',
        alignSelf: 'flex-start',
    },
    addPhotoBtn: {
        width: 60,
        height: 60,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center'
    },
    saveButton: {
        backgroundColor: Theme.PRIMARY,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 10,
        marginTop: 24
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    }
});
