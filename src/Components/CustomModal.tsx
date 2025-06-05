import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Dimensions, Alert, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import CustomButton from './CustomButton'; 
import { Theme } from '../../constants/Themes'; 
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ChangePasswordModalProps {
    isVisible: boolean;
    onClose: () => void;
    onUpdatePassword: (id: number, newPassword: string) => Promise<any>;
    entityId: number | null; 
}

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

export default function ChangePasswordModal({ isVisible, onClose, onUpdatePassword, entityId }: ChangePasswordModalProps) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const handleChangePassword = async () => {
        if (!entityId) {
            Alert.alert('Erro', 'ID da entidade não identificado. Não foi possível alterar a senha.');
            return;
        }

        if (newPassword.length < 3) {
            Alert.alert('Erro', 'A nova senha deve ter pelo menos 3 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }

        setLoading(true);
        try {
            await onUpdatePassword(entityId, newPassword);
            Alert.alert('Sucesso', 'Senha alterada com sucesso!');
            setNewPassword('');
            setConfirmPassword('');
            onClose();
        } catch (err: any) {
            if (err.response?.data?.message) {
                Alert.alert('Erro', err.response.data.message);
            } else {
                Alert.alert('Erro', 'Não foi possível alterar a senha. Tente novamente mais tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            transparent={true}
            visible={isVisible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Alterar Senha</Text>

                        <TextInput
                            label="Nova Senha"
                            mode="outlined"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            style={styles.input}
                            theme={inputTheme}
                            secureTextEntry={!showPassword}
                            returnKeyType="next"
                            onSubmitEditing={() => { }}
                            right={<TextInput.Icon
                                icon={showPassword ? 'eye-off' : 'eye'}
                                onPress={() => setShowPassword((prev) => !prev)}
                            />}
                        />
                        <TextInput
                            label="Confirmar Nova Senha"
                            mode="outlined"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            style={styles.input}
                            theme={inputTheme}
                            secureTextEntry={!showConfirmPassword}
                            returnKeyType="done"
                            onSubmitEditing={handleChangePassword}
                            right={<TextInput.Icon
                                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                                onPress={() => setShowConfirmPassword((prev) => !prev)}
                            />}
                        />
                        <CustomButton
                            title={'Salvar Senha'}
                            borderColor="transparent"
                            textColor={Theme.BACK}
                            color={Theme.PRIMARY}
                            onPress={handleChangePassword}
                            disabled={loading}
                            buttonStyle={styles.saveButton}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: width,
        backgroundColor: '#fff',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        padding: 20,
        alignItems: 'center',
        position: 'absolute',
        bottom: 0
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
        padding: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontFamily: 'Poppins-SemiBold',
        color: Theme.PRIMARY,
        marginBottom: 20,
        marginTop: 10,
    },
    input: {
        marginBottom: 15,
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    saveButton: {
        marginTop: 10,
        width: '100%',
    },
});