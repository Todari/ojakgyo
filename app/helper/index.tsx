import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PretendardText } from '@/components/StyledText';
import { StyleSheet } from 'react-native';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { Categories } from '@/components/Categories';
import { useRouter } from 'expo-router';

export default function HelperPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Header left='back'/>
      <PretendardText style={styles.headerText}>도움이 필요하신 분들을 찾아볼까요?</PretendardText>
      <Button title="지도에서 어르신 찾기" onPress={() => router.push('/helper/map')}/>
      <Categories />
      <Button title="직접 도우미 등록하기" onPress={() => {}} variant="secondary"/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    paddingHorizontal: 24,
    gap: 24,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});