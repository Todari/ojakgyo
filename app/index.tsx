import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { useRouter } from 'expo-router';
import { Header } from '@/components/Header';
import { SafeAreaView } from '@/components/Themed';
import { Typography } from '@/components/Typography';

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Header left='logo'/>
      
      <View style={styles.content}>
        <Typography variant='title' weight='bold' style={styles.title}>
          오작교에 오신 것을 환영합니다
        </Typography>
        
        <Typography variant='body' style={styles.subtitle}>
          어르신과 젊은 세대를 연결하는 따뜻한 도움 플랫폼
        </Typography>

        <View style={styles.buttonContainer}>
          <Button
            title="Children으로 이동"
            onPress={() => router.push('/children')}
            style={styles.button}
          />
          <Button
            title="Helper로 이동"
            variant="secondary"
            onPress={() => router.push('/helper')}
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    marginTop: 8,
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
    opacity: 0.7,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    marginBottom: 8,
  },
});