import { FontAwesome } from '@expo/vector-icons';
import { PretendardText } from './StyledText';
import { View } from './Themed';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

type HeaderLeft = 'logo' | 'back';

interface HeaderProps {
  left?: HeaderLeft;
}

export function Header({ left }: HeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {left === 'logo' && <PretendardText style={{ fontSize: 24, fontWeight: 'black' }}>OJAKGYO</PretendardText>}
      {left === 'back' && 
      <Pressable onPress={() => router.back()}>
        <FontAwesome name="chevron-left" size={24} color="#333" />
      </Pressable>
      }
      <View style={styles.rightContainer}>
        <Pressable onPress={() => {}}>
          <FontAwesome name="comments" size={40} color="#999" />
        </Pressable>
        <Pressable onPress={() => {}}>
          <FontAwesome name="user" size={40} color="#999" />
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
