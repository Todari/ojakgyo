import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from '@/components/Themed';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header left='logo' />
      <View style={styles.content}>
        <Button title='로그아웃' variant='secondary' onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16, justifyContent: 'center' },
});


