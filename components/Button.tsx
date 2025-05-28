import React from 'react';
import { Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Text } from './Themed';
import {Button as DefaultButton} from 'react-native';
import { PretendardText } from './StyledText';

type ButtonSize = 'medium';
type ButtonVariant = 'primary' | 'secondary';
type ButtonWidth = 'full' | 'fit';

type ButtonStyleProps = {
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: ButtonSize;
  variant?: ButtonVariant;
  width?: ButtonWidth;
};

type ButtonProps = DefaultButton['props'] & ButtonStyleProps;


export function Button({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
  size = 'medium',
  variant = 'primary',
  width = 'fit',
  ...props  
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        buttonBaseStyle[width],
        buttonVariantStyle[variant],
        buttonSizeStyle[size],
        style,
        disabled && buttonBaseStyle.disabled,
        pressed && buttonBaseStyle.pressed,
      ]}
      {...props}
    >
      <PretendardText style={[textSizeStyle[size], textVariantStyle[variant], textStyle]}>
        {title}
      </PretendardText>
    </Pressable>
  );
}

const buttonBaseStyle = StyleSheet.create({
  full: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fit: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
});

const buttonVariantStyle = StyleSheet.create({
  primary: {
    backgroundColor: '#21B500',
    color: '#fff',
  },
  secondary: {
    backgroundColor: '#E5E5E5',
    color: '#333',
  },
});

const textVariantStyle = StyleSheet.create({
  primary: {
    color: '#fff',
  },
  secondary: {
    color: '#333',
  },
});

const buttonSizeStyle = StyleSheet.create({
  medium: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
});

const textSizeStyle = StyleSheet.create({
  medium: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});