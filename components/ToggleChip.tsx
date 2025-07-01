import React from 'react';
import { Pressable, ViewStyle, StyleSheet, TextStyle } from 'react-native';
import { palette } from '@/constants/colors';
import { useColorScheme } from './useColorScheme';
import { Typography, TextVariant } from '@/components/Typography';

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

type ChipVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';

type ChipSize = 'sm' | 'md';

export interface ToggleChipProps {
  label: string;
  selected: boolean;
  onPress?: () => void;
  variant?: ChipVariant;
  size?: ChipSize;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const SIZE_PRESET: Record<ChipSize, { container: ViewStyle; text: TextVariant }> = {
  sm: {
    container: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
    text: 'label',
  },
  md: {
    container: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 999 },
    text: 'body',
  },
};

function getColors(theme: 'light' | 'dark', variant: ChipVariant, selected: boolean) {
  const pal = palette;
  switch (variant) {
    case 'primary':
      return selected
        ? { bg: pal.primary[100], text: pal.primary[700] }
        : { bg: pal.gray[100], text: pal.gray[600] };
    case 'secondary':
      return selected
        ? { bg: pal.gray[200], text: pal.gray[800] }
        : { bg: pal.gray[50], text: pal.gray[500] };
    case 'success':
      return selected
        ? { bg: pal.success[100], text: pal.success[700] }
        : { bg: pal.gray[100], text: pal.gray[600] };
    case 'warning':
      return selected
        ? { bg: pal.warning[100], text: pal.warning[700] }
        : { bg: pal.gray[100], text: pal.gray[600] };
    case 'error':
      return selected
        ? { bg: pal.error[100], text: pal.error[700] }
        : { bg: pal.gray[100], text: pal.gray[600] };
  }
}

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export const ToggleChip = React.forwardRef<any, ToggleChipProps>(function ToggleChip(
  {
    label,
    selected,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    style,
    textStyle,
  },
  ref
) {
  const theme = useColorScheme() ?? 'light';
  const colors = getColors(theme, variant, selected);

  const containerStyles = [
    SIZE_PRESET[size].container,
    {
      backgroundColor: colors.bg,
      opacity: disabled ? 0.5 : 1,
    },
    style,
  ];

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        ...containerStyles,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Typography
        variant={SIZE_PRESET[size].text}
        style={([ { color: colors.text }, textStyle].filter(Boolean) as TextStyle[])}
      >
        {label}
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
});
