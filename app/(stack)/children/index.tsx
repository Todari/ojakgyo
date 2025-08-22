import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from '@/components/Themed';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { Typography } from '@/components/Typography';
import { router } from 'expo-router';

export default function ChildrenPage() {
  return (
    <SafeAreaView style={styles.container}>
      <Header left='back'/>
      <View style={styles.content}>
        <Typography variant='title' weight='bold' style={styles.title}>
          누구에게 도움이 필요하신가요?
        </Typography>
        <Typography variant='body' style={styles.subtitle}>
          어르신을 위한 맞춤 도움 서비스를 제공합니다
        </Typography>
        <View style={styles.buttonContainer}>
          <Button 
            title="부모님 연결해 드리기" 
            onPress={() => {}} 
            style={styles.button}
          />
          <Button 
            title="내가 도움받기" 
            onPress={() => router.push('/request')}
            variant="secondary"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  title: { marginTop: 8, marginBottom: 8 },
  subtitle: { marginBottom: 32, opacity: 0.7 },
  buttonContainer: { gap: 16 },
  button: { marginBottom: 8 },
});



