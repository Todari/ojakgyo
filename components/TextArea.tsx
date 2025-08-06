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

export type TextAreaSize = 'sm' | 'md' | 'lg';

export interface TextAreaProps extends TextInputProps {
  /** 시각적 크기(sm | md | lg) */
  size?: TextAreaSize;
  /** 100% 너비 여부 */
  fullWidth?: boolean;
  /** 유효성 오류 상태 */
  invalid?: boolean;
  /** 라벨 */
  label?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const SIZE_PRESET: Record<TextAreaSize, { minHeight: number; fontSize: number; padding: number }> = {
  sm: { minHeight: 80, fontSize: 14, padding: 12 },
  md: { minHeight: 100, fontSize: 16, padding: 16 },
  lg: { minHeight: 120, fontSize: 18, padding: 20 },
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export const TextArea = forwardRef<TextInput, TextAreaProps>(function TextArea(
  {
    size = 'md',
    fullWidth,
    invalid = false,
    label,
    style,
    containerStyle,
    inputStyle,
    ...rest
  },
  ref
) {
  const theme = useColorScheme() ?? 'light';
  const [focused, setFocused] = useState(false);

  const preset = SIZE_PRESET[size];

  const borderColor = invalid
    ? '#EF4444'
    : focused
    ? Colors[theme].tint
    : Colors[theme].tokens.border.default;

  const textColor = Colors[theme].text;
  const placeholderColor = Colors[theme].tokens.text.secondary ?? '#9CA3AF';
  // const backgroundColor = Colors[theme].tokens.bg.default;

  const inputStyles: TextStyle = {
    minHeight: preset.minHeight,
    padding: preset.padding,
    borderRadius: 12,
    borderWidth: 1,
    borderColor,
    // backgroundColor,
    fontSize: preset.fontSize,
    color: textColor,
    textAlignVertical: 'top',
  };

  return (
    <View style={[fullWidth && { width: '100%' }, containerStyle]}>
      {label && (
        <Typography variant="label" color="secondary" style={{ marginBottom: 4, marginLeft: 4 }}>
          {label}
        </Typography>
      )}

      <TextInput
        ref={ref}
        multiline
        placeholderTextColor={placeholderColor}
        style={[inputStyles, style, inputStyle]}
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
    </View>
  );
});

/* -------------------------------------------------------------------------- */
/*                                    Styles                                  */
/* -------------------------------------------------------------------------- */

// no extra stylesheet needed at the moment 