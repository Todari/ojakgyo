import { FontAwesome } from '@expo/vector-icons';
import { View } from './Themed';
import { Image, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { Typography } from '@/components/Typography';

type HeaderLeft = 'logo' | 'back';

interface HeaderProps {
  left?: HeaderLeft;
  title?: string;
  avatarUrl?: string | null;
  onTitlePress?: () => void;
}

export function Header({ left, title, avatarUrl, onTitlePress }: HeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {left === 'logo' && <Typography variant='subtitle' color='default' weight='black'>OJAKGYO</Typography>}
      {left === 'back' && 
      <Pressable onPress={() => router.back()}>
        <FontAwesome name="chevron-left" size={24} color={Colors.light.text} />
      </Pressable>
      }
      {!!title && (
        <Pressable style={styles.center} onPress={onTitlePress} disabled={!onTitlePress}>
          <View style={styles.centerContent}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.centerAvatar} />
            ) : null}
            <Typography variant='body' weight='semibold'>{title}</Typography>
          </View>
        </Pressable>
      )}
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
center: {
  flex: 1,
  alignItems: 'center',
},
centerContent: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
centerAvatar: {
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: '#E5E7EB',
},
rightContainer: {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 24,
  backgroundColor: 'transparent',
},
});
