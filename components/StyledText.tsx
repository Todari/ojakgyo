import { Text, TextProps } from './Themed';
import { Platform, StyleSheet } from 'react-native';

export function MonoText(props: TextProps) {
  return <Text {...props} style={[props.style, { fontFamily: 'SpaceMono' }]} />;
}

const getPretendardFontFamily = (fontWeight: string | number = '400') => {
  switch (fontWeight) {
    case '100':
    case 100:
    case 'thin':
      return 'PretendardThin';
    case '200':
    case 200:
    case 'extralight':
      return 'PretendardExtraLight';
    case '300':
    case 300:
    case 'light':
      return 'PretendardLight';
    case '400':
    case 400:
    case 'normal':
    case 'regular':
    default:
      return 'PretendardRegular';
    case '500':
    case 500:
    case 'medium':
      return 'PretendardMedium';
    case '600':
    case 600:
    case 'semibold':
      return 'PretendardSemiBold';
    case '700':
    case 700:
    case 'bold':
      return 'PretendardBold';
    case '800':
    case 800:
    case 'extrabold':
      return 'PretendardExtraBold';
    case '900':
    case 900:
    case 'black':
      return 'PretendardBlack';
  }
};

export function PretendardText(props: TextProps) {
  const flatStyle = StyleSheet.flatten(props.style) || {};
  const fontWeight = flatStyle.fontWeight || '400';
  const fontFamily = getPretendardFontFamily(fontWeight);

  const { fontWeight: _, ...restStyle } = flatStyle;

  return (
    <Text
      {...props}
      style={[restStyle, { fontFamily }]}
    />
  );
}