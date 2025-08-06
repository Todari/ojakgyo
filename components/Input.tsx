import React, { forwardRef, useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useColorScheme } from './useColorScheme';
import Colors from '@/constants/colors';
import { Typography } from '@/components/Typography';

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

export type InputFieldSize = 'sm' | 'md' | 'lg';

export interface InputProps extends TextInputProps {
  /** 시각적 크기(sm | md | lg) */
  inputSize?: InputFieldSize;
  /** 100% 너비 여부 */
  fullWidth?: boolean;
  /** 유효성 오류 상태 */
  invalid?: boolean;
  /** 왼쪽 아이콘 */
  leftIcon?: React.ReactNode;
  /** 오른쪽 아이콘 */
  rightIcon?: React.ReactNode;
  /** 라벨 텍스트 */
  label?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const SIZE_PRESET: Record<
  InputFieldSize,
  {
    height: number;
    paddingHorizontal: number;
    fontSize: number;
  }
> = {
  sm: { height: 40, paddingHorizontal: 12, fontSize: 14 },
  md: { height: 48, paddingHorizontal: 16, fontSize: 16 },
  lg: { height: 56, paddingHorizontal: 20, fontSize: 18 },
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    inputSize = 'md',
    fullWidth,
    invalid = false,
    leftIcon,
    rightIcon,
    style,
    containerStyle,
    inputStyle,
    ...rest
  },
  ref
) {
  const theme = useColorScheme() ?? 'light';
  const [focused, setFocused] = useState(false);

  const size = SIZE_PRESET[inputSize];

  /* ------------------------------ Styles Compute ----------------------------- */
  const borderColor = invalid
    ? '#EF4444'
    : focused
    ? Colors[theme].tint
    : Colors[theme].tokens.border.default;

  const textColor = Colors[theme].text;
  const placeholderColor = Colors[theme].tokens.text.secondary ?? '#9CA3AF';
  // const backgroundColor = Colors[theme].tokens.bg.default;

  const inputPaddingLeft = leftIcon ? size.paddingHorizontal + 24 : size.paddingHorizontal;
  const inputPaddingRight = rightIcon ? size.paddingHorizontal + 24 : size.paddingHorizontal;

  const inputStyles: TextStyle = {
    height: size.height,
    paddingLeft: inputPaddingLeft,
    paddingRight: inputPaddingRight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor,
    // backgroundColor,
    fontSize: size.fontSize,
    color: textColor,
  };

  const wrapperStyles: ViewStyle = {
    position: 'relative',
    width: fullWidth ? '100%' : undefined,
  };

  /* --------------------------------- Return --------------------------------- */

  return (
    <View style={[fullWidth && { width: '100%' }, containerStyle]}>
      {label && (
        <Typography variant="label" color="secondary" style={{ marginBottom: 4, marginLeft: 4 }}>
          {label}
        </Typography>
      )}

      <View style={wrapperStyles}>
        {leftIcon && <View style={[styles.iconLeft]}>{leftIcon}</View>}

        <TextInput
          ref={ref}
          style={[inputStyles, style, inputStyle]}
          placeholderTextColor={placeholderColor}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />

        {rightIcon && <View style={[styles.iconRight]}>{rightIcon}</View>}
      </View>
    </View>
  );
});

/* -------------------------------------------------------------------------- */
/*                                    Styles                                  */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  iconLeft: {
    position: 'absolute',
    left: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconRight: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
