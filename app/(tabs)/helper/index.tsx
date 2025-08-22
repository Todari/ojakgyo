import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from '@/components/Themed';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { Categories } from '@/components/Categories';
import { useRouter, useFocusEffect } from 'expo-router';
import { Typography } from '@/components/Typography';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';

interface HelperApplication {
  id: string;
  name: string;
  status: 'published' | 'private';
  created_at: string;
  categories: string[];
}

export default function HelperPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [application, setApplication] = useState<HelperApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchApplication();
    }
  }, [profile]);

  useFocusEffect(
    React.useCallback(() => {
      if (profile?.id) {
        fetchApplication();
      }
    }, [profile])
  );

  const fetchApplication = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('helper_applications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setApplication(null);
          return;
        }
        if (error.code === '42P01') {
          setApplication(null);
          return;
        }
        setApplication(null);
        return;
      }

      setApplication(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return '게시됨';
      case 'private':
        return '비공개';
      default:
        return '알 수 없음';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return '#21B500';
      case 'private':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const handleRegister = () => {
    if (application) {
      router.push('/helper/edit');
    } else {
      router.push('/helper/register/location');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header left='logo' />
      <View style={styles.content}>
        <Typography variant='title' weight='bold' style={styles.title}>
          도움이 필요하신 분들을 찾아볼까요?
        </Typography>

        <Typography variant='body' style={styles.subtitle}>
          어르신을 위한 맞춤 도움 서비스를 제공합니다
        </Typography>

        <Button 
          title="지도에서 어르신 찾기" 
          onPress={() => router.push('/helper/map')}
          style={styles.button}
        />
        <Categories />

        {application && (
          <View style={styles.applicationStatus}>
            <View style={styles.statusHeader}>
              <Typography variant='label' weight='semibold'>
                내 도우미 프로필
              </Typography>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
                <Typography variant='caption' style={styles.statusText}>
                  {getStatusText(application.status)}
                </Typography>
              </View>
            </View>
            <Typography variant='body' style={styles.applicationInfo}>
              {application.name} • {application.categories.length}개 카테고리 • {new Date(application.created_at).toLocaleDateString()} 등록
            </Typography>
            {application.status === 'published' && (
              <Typography variant='caption' style={styles.statusHint}>
                어르신들이 회원님의 프로필을 볼 수 있습니다.
              </Typography>
            )}
            {application.status === 'private' && (
              <Typography variant='caption' style={styles.statusHint}>
                현재 비공개 상태입니다. 수정에서 공개로 변경할 수 있습니다.
              </Typography>
            )}
          </View>
        )}

        <Button
          title={application ? '신청서 수정하기' : '직접 도우미 등록하기'}
          onPress={handleRegister}
          variant='secondary'
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  title: { marginTop: 8, marginBottom: 8 },
  subtitle: { marginBottom: 32, opacity: 0.7 },
  applicationStatus: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', padding: 16, borderRadius: 16, marginBottom: 24 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: 'white', fontWeight: '600' },
  applicationInfo: { opacity: 0.7, marginBottom: 8 },
  statusHint: { color: '#6b7280', fontSize: 12, fontStyle: 'italic' },
  button: { marginBottom: 16 },
});


