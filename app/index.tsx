import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '@/components/Header';
import { SafeAreaView } from '@/components/Themed';
import { Typography } from '@/components/Typography';
import { useAuth } from '@/hooks/useAuth';

export default function IndexGate() {
  const router = useRouter();
  const { profile, session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace('/auth');
    } else {
      // 역할에 따른 홈은 탭의 home 화면에서 분기 처리
      // 여기서는 탭이 보이도록 항상 탭 홈으로 이동
      router.replace('/(tabs)/home');
    }
  }, [loading, session, profile?.role, router]);

  return (
    <SafeAreaView style={styles.container}>
      <Header left='logo'/>
      <View style={styles.content}>
        <Typography variant='title' weight='bold' style={styles.title}>
          로딩 중...
        </Typography>
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
});