import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/Header';

export default function Home() {

  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Header left='logo'/>
      <Button
        title="Children으로 이동"
        onPress={() => router.push('/children')}
      />
      <Button
        title="Helper로 이동"
        variant="secondary"
        onPress={() => router.push('/helper')}
      />
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
