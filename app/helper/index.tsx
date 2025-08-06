import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { SafeAreaView } from '@/components/Themed';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { Categories } from '@/components/Categories';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/Typography';
// import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';

interface HelperApplication {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  categories: string[];
}

export default function HelperPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [application, setApplication] = useState<HelperApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchApplication();
    }
  }, [session]);

  const fetchApplication = async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('helper_applications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching application:', error);
        return;
      }

      setApplication(data);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '검토 중';
      case 'approved':
        return '승인됨';
      case 'rejected':
        return '거절됨';
      default:
        return '알 수 없음';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const handleRegister = () => {
    if (application && application.status === 'pending') {
      Alert.alert(
        '신청서 검토 중',
        '이미 제출된 신청서가 검토 중입니다. 결과를 기다려주세요.',
        [{ text: '확인' }]
      );
      return;
    }
    router.push('/helper/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header left='back' />
      
      <View style={styles.content}>
        <Typography variant='title' weight='bold' style={styles.title}>
          도움이 필요하신 분들을 찾아볼까요?
        </Typography>

        <Typography variant='body' style={styles.subtitle}>
          어르신을 위한 맞춤 도움 서비스를 제공합니다
        </Typography>

        {/* 신청 상태 표시 */}
        {application && (
          <View style={styles.applicationStatus}>
            <View style={styles.statusHeader}>
              <Typography variant='label' weight='semibold'>
                도우미 신청 상태
              </Typography>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
                <Typography variant='caption' style={styles.statusText}>
                  {getStatusText(application.status)}
                </Typography>
              </View>
            </View>
            <Typography variant='body' style={styles.applicationInfo}>
              신청자: {application.name} • {new Date(application.created_at).toLocaleDateString()}
            </Typography>
          </View>
        )}

        <Button 
          title="지도에서 어르신 찾기" 
          onPress={() => router.push('/helper/map')}
          style={styles.button}
        />
        
        <Categories />
        
        <Button
          title={application ? "신청서 수정하기" : "직접 도우미 등록하기"}
          onPress={handleRegister}
          variant="secondary"
          style={styles.button}
        />
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
  },
  applicationStatus: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
  },
  applicationInfo: {
    opacity: 0.7,
  },
  button: {
    marginBottom: 16,
  },
});