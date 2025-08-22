import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from '@/components/Themed';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { ToggleChip } from '@/components/ToggleChip';
import { BottomButton } from '@/components/BottomButton';
import { HELP_CATEGORIES } from '@/constants/categories';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function RequestRegisterPage() {
  const router = useRouter();
  const { lat, lng } = useLocalSearchParams();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]);
  };
  const handleNext = () => {
    if (selectedCategories.length === 0) { alert('최소 하나의 카테고리를 선택해주세요.'); return; }
    const params = new URLSearchParams({ categories: selectedCategories.join(',') });
    if (typeof lat === 'string' && typeof lng === 'string') { params.set('lat', lat); params.set('lng', lng); }
    router.push(`/request/register/details?${params.toString()}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header left='back'/>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Typography variant='title' weight='bold' style={styles.title}>어떤 도움을 받길 원하시나요?</Typography>
        <Typography variant='body' style={styles.subtitle}>필요한 도움의 종류를 선택해주세요 (복수 선택 가능)</Typography>
        <View style={styles.categoriesContainer}>
          {HELP_CATEGORIES.map((category) => (
            <View key={category.id} style={styles.categoryItem}>
              <ToggleChip label={`${category.icon} ${category.label}`} selected={selectedCategories.includes(category.id)} onPress={() => handleCategoryToggle(category.id)} variant="primary" size="md" style={styles.chip} />
            </View>
          ))}
        </View>
      </ScrollView>
      <BottomButton title={`다음 (${selectedCategories.length}개 선택)`} onPress={handleNext} disabled={selectedCategories.length === 0} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  title: { marginTop:8, marginBottom: 8, lineHeight: 32 },
  subtitle: { marginBottom: 32, opacity: 0.7 },
  categoriesContainer: { gap: 12 },
  categoryItem: { marginBottom: 4 },
  chip: { alignSelf: 'flex-start' },
});


