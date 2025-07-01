import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import Typography from '@/components/Typography';

export default function ChildrenPage() {

  return (
    <SafeAreaView style={styles.container}>
      <Header left='back'/>
      <Typography variant='title' weight='bold'>누구에게 도움이 필요하신가요?</Typography>
      <Button title="부모님 연결해 드리기" onPress={() => {}}/>
      <Button title="내가 도움받기" onPress={() => {}} variant="secondary"/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    paddingHorizontal: 24,
    gap: 24,
  },
});