import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from '@/components/Themed';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { ToggleChip } from '@/components/ToggleChip';
import { BottomButton } from '@/components/BottomButton';
import { supabase } from '@/utils/supabase';
import { HELP_CATEGORIES } from '@/constants/categories';
import { useAuth } from '@/hooks/useAuth';

type HelpRequestDetail = {
  id: number;
  user_id: number;
  categories: string[];
  details: string;
  created_at: string;
};

export default function HelpRequestDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<HelpRequestDetail | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      const requestId = /^\d+$/.test(String(id)) ? Number(id) : id;
      try {
        const { data, error } = await supabase
          .from('help_requests')
          .select('id, user_id, categories, details, created_at')
          .eq('id', requestId as any)
          .single();
        if (error) {
          console.error('fetch help request detail error:', error);
          if ((error as any).code === 'PGRST116') {
            Alert.alert('알림', '요청서를 찾을 수 없습니다.', [{ text: '확인', onPress: () => router.back() }]);
            return;
          }
          Alert.alert('오류', '요청서 조회 중 오류가 발생했습니다.');
          return;
        }
        setRequest(data as unknown as HelpRequestDetail);
      } catch (e) {
        console.error('fetch help request detail unexpected error:', e);
        Alert.alert('오류', '예기치 못한 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const openOrCreateChat = async () => {
    if (!profile?.id) {
      Alert.alert('알림', '로그인이 필요합니다.');
      router.push('/auth');
      return;
    }
    if (!request?.user_id) return;

    try {
      const me = Number(profile.id);
      const other = Number(request.user_id);
      const [a, b] = me < other ? [me, other] : [other, me];
      const roomKey = `${a}:${b}`;

      const { data: existing, error: findErr } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('type', 'dm')
        .eq('room_key', roomKey)
        .limit(1)
        .maybeSingle();
      if (findErr && (findErr as any).code !== '42P01') {
        console.error('find room error', findErr);
      }

      let roomId: string | null = existing?.id ? String((existing as any).id) : null;
      if (!roomId) {
        const { data: created, error: createErr } = await supabase
          .from('chat_rooms')
          .upsert({ type: 'dm', participants: [a, b], room_key: roomKey }, { onConflict: 'room_key' })
          .select('id')
          .single();
        if (createErr) {
          console.error('create room error', createErr);
          Alert.alert('오류', '채팅방 생성에 실패했습니다.');
          return;
        }
        roomId = created?.id ? String((created as any).id) : null;
      }

      if (roomId) {
        const params = new URLSearchParams({ other: String(request.user_id) });
        router.push(`/chat/${roomId}?${params.toString()}`);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('오류', '채팅방 연결에 실패했습니다.');
    }
  };

  const selectedCategories = request?.categories ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <Header left='back' />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Typography variant='title' weight='bold' style={styles.title}>
          {loading ? '불러오는 중...' : '요청서 상세'}
        </Typography>

        {!loading && request && (
          <View style={styles.summaryContainer}>
            <View style={styles.section}>
              <Typography variant='body' weight='semibold' style={styles.sectionTitle}>필요한 도움</Typography>
              <View style={styles.categoriesContainer}>
                {selectedCategories.map((categoryId) => {
                  const c = HELP_CATEGORIES.find((x) => x.id === categoryId);
                  const label = c?.displayTitle || c?.label || categoryId;
                  return (
                    <ToggleChip
                      key={categoryId}
                      label={label}
                      selected
                      variant='primary'
                      size='sm'
                      disabled
                      style={styles.categoryChip}
                    />
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Typography variant='body' weight='semibold' style={styles.sectionTitle}>추가 요청사항</Typography>
              <View style={styles.textContainer}>
                <Typography variant='body' style={styles.textContent}>{request?.details}</Typography>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <BottomButton title={'메세지 보내기'} onPress={openOrCreateChat} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  title: { marginTop: 8, marginBottom: 8 },
  summaryContainer: { gap: 24 },
  section: { gap: 12 },
  sectionTitle: { marginBottom: 8 },
  categoriesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { opacity: 0.9 },
  textContainer: { backgroundColor: '#f8f9fa', padding: 16, borderRadius: 12 },
  textContent: { lineHeight: 20 },
});


