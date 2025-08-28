import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from '@/components/Themed';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { Categories } from '@/components/Categories';
import { Typography } from '@/components/Typography';
import { useAuth } from '@/hooks/useAuth';
import { useHelpRequestLatest } from '@/features/request/hooks/useHelpRequestLatest';
import { formatRequestStatusText, formatRequestStatusColor } from '@/utils/format';

type RequestStatus = 'published' | 'private';

export default function RequestPage() {
  const router = useRouter();
  const { profile } = useAuth();

  const userId = typeof profile?.id === 'number' ? profile?.id : undefined;
  const { data: request, loading, refetch } = useHelpRequestLatest(userId);

  useEffect(() => {
    if (userId) {
      refetch();
    }
  }, [userId]);

  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        refetch();
      }
    }, [userId])
  );

  // 데이터 로딩은 훅이 담당

  const getStatusText = formatRequestStatusText;
  const getStatusColor = formatRequestStatusColor;

  const handleRegister = () => {
    if (request) {
      router.push('/request/edit');
    } else {
      router.push('/request/register/location');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header left='back' />

      <View style={styles.content}>
        <Typography variant='title' weight='bold' style={styles.title}>
          어떤 도움이 필요하신가요?
        </Typography>

        <Typography variant='body' style={styles.subtitle}>
          원하는 도움을 요청하거나, 주변의 도우미를 찾아보세요
        </Typography>

        <Button
          title="지도에서 도우미 찾기"
          onPress={() => router.push('/request/map')}
          style={styles.button}
        />

        <Categories onSelect={(id) => router.push(`/request/list?category=${id}`)} />

        {request && (
          <View style={styles.requestStatus}>
            <View style={styles.statusHeader}>
              <Typography variant='label' weight='semibold'>
                내 도움 요청
              </Typography>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                <Typography variant='caption' style={styles.statusText}>
                  {getStatusText(request.status)}
                </Typography>
              </View>
            </View>
            <Typography variant='body' style={styles.requestInfo}>
              {request.title} • {request.categories?.length || 0}개 카테고리 • {new Date(request.created_at).toLocaleDateString()} 등록
            </Typography>
            {request.status === 'published' && (
              <Typography variant='caption' style={styles.statusHint}>
                도우미들이 회원님의 요청을 볼 수 있습니다.
              </Typography>
            )}
            {request.status === 'private' && (
              <Typography variant='caption' style={styles.statusHint}>
                현재 비공개 상태입니다. 수정에서 공개로 변경할 수 있습니다.
              </Typography>
            )}
          </View>
        )}

        <Button
          title={request ? '요청서 수정하기' : '도움 요청 등록하기'}
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
  requestStatus: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', padding: 16, borderRadius: 16, marginBottom: 24 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: 'white', fontWeight: '600' },
  requestInfo: { opacity: 0.7, marginBottom: 8 },
  statusHint: { color: '#6b7280', fontSize: 12, fontStyle: 'italic' },
  button: { marginBottom: 16 },
});


