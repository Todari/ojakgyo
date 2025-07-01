import React from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import { Text as ThemedText, TextProps as ThemedTextProps } from './Themed';
import Colors from '@/constants/colors';
import { useColorScheme } from './useColorScheme';

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

export type TextVariant =
  | 'display'
  | 'headline'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'caption'
  | 'label';

export type TextWeight =
  | 'thin'
  | 'extralight'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black';

export type TextColor = 'default' | 'primary' | 'secondary' | 'inverse' | 'inherit';

export interface TypographyProps extends Omit<ThemedTextProps, 'style'> {
  /** 글꼴 사이즈 및 기본 굵기를 지정하는 텍스트 변형 */
  variant?: TextVariant;
  /** 글꼴 굵기 오버라이드 */
  weight?: TextWeight;
  /** 텍스트 색상(팔레트 키 또는 HEX) */
  color?: TextColor | string;
  /** 텍스트 정렬 */
  align?: 'left' | 'center' | 'right' | 'justify';
  /** 한 줄 말줄임 여부 */
  truncate?: boolean;
  style?: TextStyle | TextStyle[];
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const VARIANT_STYLES: Record<TextVariant, TextStyle> = {
  display: { fontSize: 40, lineHeight: 48 },
  headline: { fontSize: 32, lineHeight: 40 },
  title: { fontSize: 24, lineHeight: 32 },
  subtitle: { fontSize: 20, lineHeight: 28 },
  body: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 14, lineHeight: 20 },
  label: { fontSize: 12, lineHeight: 16 },
};

const getPretendardFontFamily = (weight: TextWeight = 'regular'): string => {
  switch (weight) {
    case 'thin':
      return 'PretendardThin';
    case 'extralight':
      return 'PretendardExtraLight';
    case 'light':
      return 'PretendardLight';
    case 'regular':
    default:
      return 'PretendardRegular';
    case 'medium':
      return 'PretendardMedium';
    case 'semibold':
      return 'PretendardSemiBold';
    case 'bold':
      return 'PretendardBold';
    case 'extrabold':
      return 'PretendardExtraBold';
    case 'black':
      return 'PretendardBlack';
  }
};

const COLOR_RESOLVER: Record<TextColor, (theme: 'light' | 'dark') => string | undefined> = {
  default: (theme) => Colors[theme].text,
  primary: (theme) => Colors[theme].tint,
  secondary: (theme) => (theme === 'light' ? '#666' : '#aaa'),
  inverse: (theme) => (theme === 'light' ? '#fff' : '#000'),
  inherit: () => undefined,
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export function Typography({
  variant = 'body',
  weight = 'regular',
  color = 'default',
  align,
  truncate,
  style,
  children,
  ...rest
}: TypographyProps) {
  const theme = useColorScheme() ?? 'light';

  // variant & weight style
  const baseStyle: TextStyle = {
    ...VARIANT_STYLES[variant],
    fontFamily: getPretendardFontFamily(weight),
  };

  // color style
  const resolvedColor =
    typeof color === 'string' && (color as TextColor) in COLOR_RESOLVER
      ? COLOR_RESOLVER[color as TextColor](theme)
      : typeof color === 'string'
      ? color
      : COLOR_RESOLVER.default(theme);

  const colorStyle = color === 'inherit' ? {} : { color: resolvedColor };

  // align style
  const alignStyle = align ? { textAlign: align } : {};

  const combinedStyle = StyleSheet.flatten([baseStyle, colorStyle, alignStyle, style]);

  return (
    <ThemedText
      {...rest}
      style={combinedStyle}
      numberOfLines={truncate ? 1 : rest.numberOfLines}
    >
      {children}
    </ThemedText>
  );
}