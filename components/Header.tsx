import { FontAwesome } from '@expo/vector-icons';
import { View } from './Themed';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import Typography from './Typography';

type HeaderLeft = 'logo' | 'back';

interface HeaderProps {
  left?: HeaderLeft;
}

export function Header({ left }: HeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {left === 'logo' && <Typography variant='subtitle' color='default' weight='black'>OJAKGYO</Typography>}
      {left === 'back' && 
      <Pressable onPress={() => router.back()}>
        <FontAwesome name="chevron-left" size={24} color={Colors.light.text} />
      </Pressable>
      }
      <View style={styles.rightContainer}>
        <Pressable onPress={() => {}}>
          <FontAwesome name="comments" size={40} color={Colors.light.tokens.text.secondary} />
        </Pressable>
        <Pressable onPress={() => {}}>
          <FontAwesome name="user" size={40} color={Colors.light.tokens.text.secondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
container: {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: 'transparent',
},
rightContainer: {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 24,
  backgroundColor: 'transparent',
},
});
