import { FontAwesome } from '@expo/vector-icons';
import { View } from './Themed';
import { Pressable, StyleSheet } from 'react-native';
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
            {/* avatar 생략 */}
            <Typography variant='body' weight='semibold'>{title}</Typography>
          </View>
        </Pressable>
      )}
      {/* 오른쪽 아이콘 제거 (뒤로가기 전용 헤더) */}
      <View style={styles.rightContainer} />
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
centerAvatar: {},
rightContainer: {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 24,
  backgroundColor: 'transparent',
},
});
