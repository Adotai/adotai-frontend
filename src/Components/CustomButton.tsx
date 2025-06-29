import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent, TextStyle, ViewStyle, Dimensions } from 'react-native';
import { Theme } from '../../constants/Themes';

interface CustomButtonProps {
    onPress: (event: GestureResponderEvent) => void;
    title: string;
    color?: string; // Cor de fundo do botão
    textColor?: string; // Cor do texto
    borderColor?: string; // Cor da borda
    disabled?: boolean; // Propriedade para desabilitar o botão
    textStyle?: TextStyle; // Estilo customizado para o texto
    buttonStyle?: ViewStyle; // Novo: Estilo customizado para o botão
}

const { width, height } = Dimensions.get('window');


const CustomButton: React.FC<CustomButtonProps> = ({
    onPress,
    title,
    color = Theme.PRIMARY,
    textColor = 'white',
    borderColor = Theme.PRIMARY,
    disabled = false, // Definindo valor padrão como false
    textStyle,
    buttonStyle, // Novo: Permitir estilo customizado para o botão
}) => {
    return (
        <TouchableOpacity 
            style={[
                styles.button, 
                { backgroundColor: color, borderColor: borderColor },
                buttonStyle, // Aplica estilos customizados passados como props
                disabled && styles.disabledButton // Aplica estilo de desativado se o botão estiver desativado
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={[styles.buttonText, { color: textColor }, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: width * 0.95,
        height: 50,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
    },
    buttonText: {
        textAlign:'center',
        textAlignVertical: 'center',
        fontSize: 16,
        fontFamily: "Poppins-SemiBold",
    },
    disabledButton: {
        opacity: 0.5,
    },
});

export default CustomButton;
