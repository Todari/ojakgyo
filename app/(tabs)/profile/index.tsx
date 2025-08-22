import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from '@/components/Themed';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { Typography } from '@/components/Typography';

export default function ProfilePage() {
  const { logout, profile, updateRole } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header left='logo' />
      <View style={styles.content}>
        <Typography variant='subtitle' weight='bold' style={{ marginBottom: 12 }}>내 역할 설정 : {profile?.role}</Typography>
        <View style={styles.rolesRow}>
          <Button
            title='도움 받길 원해요'
            variant={profile?.role === 'senior' ? 'primary' : 'secondary'}
            onPress={async () => { if (saving) return; setSaving(true); await updateRole('senior'); setSaving(false); }}
            style={styles.roleBtn}
          />
          {/* <Button
            title='부모님께 도우미 연결'
            variant={profile?.role === 'children' ? 'primary' : 'secondary'}
            onPress={async () => { if (saving) return; setSaving(true); await updateRole('children'); setSaving(false); }}
            style={styles.roleBtn}
          /> */}
          <Button
            title='어르신들을 도울래요'
            variant={profile?.role === 'helper' ? 'primary' : 'secondary'}
            onPress={async () => { if (saving) return; setSaving(true); await updateRole('helper'); setSaving(false); }}
            style={styles.roleBtn}
          />
        </View>

        <Button title='로그아웃' variant='secondary' onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16, justifyContent: 'center', gap: 16 },
  rolesRow: { gap: 12 },
  roleBtn: { alignSelf: 'stretch' },
});


