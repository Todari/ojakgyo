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

type HelperDetail = {
  id: string;
  user_id: string;
  name: string;
  age: number | null;
  categories: string[];
  introduction: string | null;
  experience?: string | null;
  users?: { id: string; nickname?: string | null; thumbnail_url?: string | null } | null;
};

export default function HelperDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [helper, setHelper] = useState<HelperDetail | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      const helperId = Array.isArray(id) ? id[0] : id;
      const idFilter = /^\d+$/.test(helperId) ? Number(helperId) : helperId;
      try {
        const { data, error } = await supabase
          .from('helper_applications')
          .select('*')
          .eq('id', idFilter)
          .single();

        if (error) {
          console.error('fetch helper detail error:', error);
          if ((error as any).code === 'PGRST116') {
            Alert.alert('알림', '신청서를 찾을 수 없습니다.', [{ text: '확인', onPress: () => router.back() }]);
            return;
          }
          Alert.alert('오류', `신청서 조회 중 오류가 발생했습니다.\n${(error as any).message || ''}`.trim());
          return;
        }
        setHelper(data as unknown as HelperDetail);
      } catch (e) {
        console.error('fetch helper detail unexpected error:', e);
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
    if (!helper?.user_id) return;

    try {
      // 룸 조회 또는 생성. participants 배열 대신 room_key로 일관된 1:1 방을 보장
      const me = Number(profile.id);
      const other = Number(helper.user_id);
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
          .insert({ type: 'dm', participants: [a, b], room_key: roomKey, created_at: new Date().toISOString() })
          .select('id')
          .single();
        if (createErr) {
          console.error('create room error', createErr);
          if ((createErr as any).code === '42P01') {
            Alert.alert('설정 필요', 'chat_rooms 테이블이 없습니다. DB에 채팅 스키마를 추가해주세요.');
            return;
          }
          Alert.alert('오류', `채팅방 생성에 실패했습니다.\n${(createErr as any).message || ''}`.trim());
          return;
        }
        roomId = created?.id ? String((created as any).id) : null;
      }

      if (roomId) {
        const params = new URLSearchParams({ other: String(helper.user_id) });
        router.push(`/chat/${roomId}?${params.toString()}`);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('오류', '채팅방 연결에 실패했습니다.');
    }
  };

  const selectedCategories = helper?.categories ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <Header left='back'/>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Typography variant='title' weight='bold' style={styles.title}>
          {loading ? '불러오는 중...' : `${helper?.name || '도우미'} 프로필`}
        </Typography>

        {!loading && helper && (
          <View style={styles.summaryContainer}>
            <View style={styles.section}>
              <Typography variant='body' weight='semibold' style={styles.sectionTitle}>도움 가능한 항목</Typography>
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
              <Typography variant='body' weight='semibold' style={styles.sectionTitle}>개인 정보</Typography>
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <Typography variant='body' weight='medium'>이름:</Typography>
                  <Typography variant='body'>{helper?.name}</Typography>
                </View>
                {helper?.age != null && (
                  <View style={styles.infoRow}>
                    <Typography variant='body' weight='medium'>나이:</Typography>
                    <Typography variant='body'>{helper?.age}세</Typography>
                  </View>
                )}
              </View>
            </View>

            {helper?.introduction && (
              <View style={styles.section}>
                <Typography variant='body' weight='semibold' style={styles.sectionTitle}>자기소개</Typography>
                <View style={styles.textContainer}>
                  <Typography variant='body' style={styles.textContent}>{helper?.introduction}</Typography>
                </View>
              </View>
            )}

            {helper?.experience && (
              <View style={styles.section}>
                <Typography variant='body' weight='semibold' style={styles.sectionTitle}>관련 경험</Typography>
                <View style={styles.textContainer}>
                  <Typography variant='body' style={styles.textContent}>{helper?.experience}</Typography>
                </View>
              </View>
            )}
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
  infoContainer: { backgroundColor: '#f8f9fa', padding: 16, borderRadius: 12, gap: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textContainer: { backgroundColor: '#f8f9fa', padding: 16, borderRadius: 12 },
  textContent: { lineHeight: 20 },
});


