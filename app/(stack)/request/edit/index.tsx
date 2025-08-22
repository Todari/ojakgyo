import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from '@/components/Themed';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { ToggleChip } from '@/components/ToggleChip';
import { TextArea } from '@/components/TextArea';
import { Button } from '@/components/Button';
import { BottomButton } from '@/components/BottomButton';
import { HELP_CATEGORIES } from '@/constants/categories';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';

type RequestStatus = 'published' | 'private';

interface HelpRequest { id: number; user_id: number; categories: string[]; details: string; status: RequestStatus; }

export default function RequestEditPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState<RequestStatus>('published');

  useEffect(() => { if (profile?.id) fetchRequest(); }, [profile]);

  const fetchRequest = async () => {
    if (!profile?.id) return;
    try {
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error) {
        if (error.code === 'PGRST116') { Alert.alert('알림', '등록된 도움 요청이 없습니다.', [{ text: '확인', onPress: () => router.back() }]); return; }
        if (error.code === '42P01') { Alert.alert('오류', 'help_requests 테이블이 존재하지 않습니다.', [{ text: '확인', onPress: () => router.back() }]); return; }
        console.error('Error fetching help request:', error);
        Alert.alert('오류', '요청서를 불러오는데 실패했습니다.', [{ text: '확인', onPress: () => router.back() }]);
        return;
      }
      if (data) {
        const req = data as HelpRequest;
        setRequest(req);
        setSelectedCategories(req.categories || []);
        setDetails(req.details || '');
        setStatus(req.status || 'published');
      }
    } catch (e) {
      console.error('Unexpected error:', e);
      Alert.alert('오류', '예상치 못한 오류가 발생했습니다.');
      router.back();
    } finally { setLoading(false); }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => (prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]));
  };

  const handleSave = async () => {
    if (!request) return;
    if (selectedCategories.length === 0) { Alert.alert('필수 입력', '도움 종류를 하나 이상 선택해주세요.'); return; }
    if (!details.trim()) { Alert.alert('필수 입력', '추가 요청사항을 입력해주세요.'); return; }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('help_requests')
        .update({ categories: selectedCategories, details: details.trim(), status, updated_at: new Date().toISOString() })
        .eq('id', request.id);
      if (error) { console.error('Error updating help request:', error); Alert.alert('오류', '요청서 수정 중 오류가 발생했습니다.'); return; }
      Alert.alert('수정 완료', '도움 요청이 성공적으로 수정되었습니다.', [{ text: '확인', onPress: () => router.back() }]);
    } catch (e) { console.error('Unexpected error:', e); Alert.alert('오류', '예상치 못한 오류가 발생했습니다.'); }
    finally { setSaving(false); }
  };

  const handleDelete = () => {
    if (!request) return;
    Alert.alert('요청 삭제', '정말로 도움 요청을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: async () => {
        try {
          const { error } = await supabase.from('help_requests').delete().eq('id', request.id);
          if (error) { console.error('Error deleting help request:', error); Alert.alert('오류', '요청 삭제 중 오류가 발생했습니다.'); return; }
          Alert.alert('삭제 완료', '도움 요청이 삭제되었습니다.', [{ text: '확인', onPress: () => router.back() }]);
        } catch (e) { console.error('Unexpected error:', e); Alert.alert('오류', '예상치 못한 오류가 발생했습니다.'); }
      }}
    ]);
  };

  if (loading) return (
    <SafeAreaView style={styles.container}>
      <Header left='back' />
      <View style={styles.content}><Typography variant='title' weight='bold' style={styles.title}>로딩 중...</Typography></View>
    </SafeAreaView>
  );

  if (!request) return (
    <SafeAreaView style={styles.container}>
      <Header left='back' />
      <View style={styles.content}><Typography variant='title' weight='bold' style={styles.title}>요청을 찾을 수 없습니다</Typography></View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header left='back' />
      <ScrollView contentContainerStyle={styles.content}>
        <Typography variant='title' weight='bold' style={styles.title}>도움 요청 수정</Typography>
        <Typography variant='body' style={styles.subtitle}>등록된 도움 요청을 수정하거나 공개 상태를 변경할 수 있습니다.</Typography>
        <View style={styles.section}>
          <Typography variant='body' weight='semibold' style={styles.sectionTitle}>공개 상태</Typography>
          <View style={styles.statusChips}>
            <ToggleChip label='게시' selected={status === 'published'} onPress={() => setStatus('published')} style={styles.statusChip} />
            <ToggleChip label='비공개' selected={status === 'private'} onPress={() => setStatus('private')} style={styles.statusChip} />
          </View>
        </View>
        <View style={styles.section}>
          <Typography variant='body' weight='semibold' style={styles.sectionTitle}>도움 종류 *</Typography>
          <View style={styles.categoriesContainer}>
            {HELP_CATEGORIES.map((category) => (
              <ToggleChip key={category.id} label={category.label} selected={selectedCategories.includes(category.id)} onPress={() => handleCategoryToggle(category.id)} style={styles.categoryChip} />
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Typography variant='body' weight='semibold' style={styles.sectionTitle}>추가 요청사항 *</Typography>
          <TextArea value={details} onChangeText={setDetails} placeholder='필요한 도움에 대해 자세히 작성해주세요.' style={styles.input} />
        </View>
        <View style={styles.section}>
          <Button title='요청 삭제' onPress={handleDelete} variant='secondary' style={StyleSheet.flatten([styles.button, styles.deleteButton])} />
        </View>
        <View style={styles.bottomSpacing} />
      </ScrollView>
      <BottomButton title={saving ? '저장 중...' : '수정 완료'} onPress={handleSave} disabled={saving} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingBottom: 64 },
  title: { marginTop: 8, marginBottom: 8 },
  subtitle: { marginBottom: 32, opacity: 0.7 },
  section: { marginBottom: 24 },
  sectionTitle: { marginBottom: 12, color: '#374151' },
  statusChips: { flexDirection: 'row', gap: 8 },
  statusChip: { flex: 1 },
  categoriesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { marginBottom: 8 },
  input: { marginBottom: 16 },
  button: { width: '100%' },
  deleteButton: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  bottomSpacing: { height: 20 },
});


