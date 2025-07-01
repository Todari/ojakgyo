import Typography, { TypographyProps } from './Typography';
import { Text as ThemedText, TextProps as ThemedTextProps } from './Themed';

export function MonoText(props: ThemedTextProps) {
  return <ThemedText {...props} style={[props.style, { fontFamily: 'SpaceMono' }]} />;
}

export function PretendardText(props: TypographyProps) {
  return <Typography {...props} />;
}