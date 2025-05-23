import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Theme } from '../../constants/Themes';

export type CustomInputProps = {
  label?: string;
  value: string;
  onChange: (text: string) => void; 
  type?: TextInputProps['keyboardType'];
  secureTextEntry?: boolean;
  restrictNumeric?: boolean; 
  containerStyle?: StyleProp<ViewStyle>; 
  inputStyle?: StyleProp<TextStyle>; 
};

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  value,
  onChange,
  type = 'default',
  secureTextEntry = false,
  restrictNumeric = false,
  containerStyle,
  inputStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleTextChange = (text: string) => {
    if (restrictNumeric) {
      const numericRegex = /^[0-9]*\.?[0-9]*$/; // Aceita números com um ponto decimal
      if (!numericRegex.test(text)) return; // Ignora entradas inválidas
    }
    onChange(text); // Chama a função passada pelo componente pai
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: isFocused ? Theme.TERTIARY : Theme.INPUT,
          },
        ]}
      >
        <TextInput
          value={value}
          keyboardType={type}
          onChangeText={handleTextChange}
          secureTextEntry={secureTextEntry}
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          style={[styles.input, inputStyle]}
          {...props}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 350,
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: Theme.PRIMARY,
  },
  inputContainer: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 10,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: Theme.TEXT_FONT,
  },
});
