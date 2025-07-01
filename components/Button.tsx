import React from 'react';
import {
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Colors from '@/constants/colors';
import Typography, { TextColor, TextVariant } from './Typography';

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost';

type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const SIZE_STYLE: Record<ButtonSize, { container: ViewStyle; text: TextVariant }> = {
  sm: {
    container: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    text: 'caption'
  },
  md: {
    container: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 16,
    },
    text: 'body'
  },
  lg: {
    container: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 20,
    },
    text: 'subtitle'
  },
};

const VARIANT_STYLE: Record<ButtonVariant, { container: ViewStyle; text: TextColor }> = {
  primary: {
    container: {
      backgroundColor: Colors.light.tint,
    },
    text: 'inverse',
  },
  secondary: {
    container: {
      backgroundColor: '#E5E5E5',
    },
    text: 'default'
  },
  tertiary: {
    container: {
      backgroundColor: '#F1F1F1',
    },
    text: 'default'
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: Colors.light.tint,
    },
    text: 'default'
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
    },
    text: 'default'
  },
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export const Button = React.forwardRef<any, ButtonProps>(function Button(
  {
    title,
    onPress,
    disabled = false,
    loading = false,
    style,
    textStyle,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
  },
  ref
) {
  const containerStyles = [
    styles.base,
    SIZE_STYLE[size].container,
    VARIANT_STYLE[variant].container,
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const variantToken = SIZE_STYLE[size].text;
  const colorToken = VARIANT_STYLE[variant].text;

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        ...containerStyles,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {loading && (
        <ActivityIndicator size="small" style={{ marginRight: 8 }} />
      )}
      <Typography variant={variantToken} color={colorToken} style={textStyle} truncate weight='bold'>
        {title}
      </Typography>
    </Pressable>
  );
});

/* -------------------------------------------------------------------------- */
/*                                    Styles                                  */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
});