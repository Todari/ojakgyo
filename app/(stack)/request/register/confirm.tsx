import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { SafeAreaView } from '@/components/Themed';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { ToggleChip } from '@/components/ToggleChip';
import { BottomButton } from '@/components/BottomButton';
import { CATEGORY_MAP } from '@/constants/categories';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function RequestConfirmPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { categories, details, lat, lng } = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedCategories = typeof categories === 'string' ? categories.split(',') : [];

  const handleSubmit = async () => {
    if (!profile?.id) { Alert.alert('오류', '로그인이 필요합니다.'); router.push('/auth'); return; }
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('help_requests')
        .insert({
          user_id: profile.id,
          name: profile.name || null,
          categories: selectedCategories,
          details: details as string,
          status: 'published',
          created_at: new Date().toISOString(),
          ...(typeof lat === 'string' && typeof lng === 'string' ? { lat: parseFloat(lat), lng: parseFloat(lng) } : {}),
        });
      if (error) {
        console.error('Error submitting help request:', error);
        if (error.code === '42P01') { Alert.alert('데이터베이스 오류', 'help_requests 테이블이 존재하지 않습니다.'); return; }
        Alert.alert('오류', `제출 중 오류가 발생했습니다. 코드: ${error.code || 'Unknown'}`);
        return;
      }
      Alert.alert('등록 완료', '도움 요청이 성공적으로 등록되었습니다.', [
        { text: '확인', onPress: () => router.replace('/(tabs)/home') }
      ]);
    } catch (e) {
      console.error('Unexpected error:', e);
      Alert.alert('오류', '예상치 못한 오류가 발생했습니다.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header left='back'/>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Typography variant='title' weight='bold' style={styles.title}>요청 내용을 확인해주세요</Typography>
        <Typography variant='body' style={styles.subtitle}>제출 전에 입력한 정보를 다시 확인하세요</Typography>
        <View style={styles.summaryContainer}>
          <View style={styles.section}>
            <Typography variant='body' weight='semibold' style={styles.sectionTitle}>도움 종류</Typography>
            <View style={styles.categoriesContainer}>
              {selectedCategories.map((categoryId) => {
                const category = CATEGORY_MAP[categoryId as keyof typeof CATEGORY_MAP];
                return (
                  <ToggleChip key={categoryId} label={`${category.icon} ${category.label}`} selected variant='primary' size='sm' disabled style={styles.categoryChip} />
                );
              })}
            </View>
          </View>
          <View style={styles.section}>
            <Typography variant='body' weight='semibold' style={styles.sectionTitle}>추가 요청사항</Typography>
            <View style={styles.textContainer}><Typography variant='body' style={styles.textContent}>{String(details || '')}</Typography></View>
          </View>
        </View>
      </ScrollView>
      <BottomButton title={isSubmitting ? '제출 중...' : '요청 제출하기'} onPress={handleSubmit} disabled={isSubmitting} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  title: { marginTop: 8, marginBottom: 8 },
  subtitle: { marginBottom: 32, opacity: 0.7, lineHeight: 20 },
  summaryContainer: { gap: 24 },
  section: { gap: 12 },
  sectionTitle: { marginBottom: 8 },
  categoriesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { opacity: 0.8 },
  textContainer: { backgroundColor: '#f8f9fa', padding: 16, borderRadius: 12 },
  textContent: { lineHeight: 20 },
});


