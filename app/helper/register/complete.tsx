import { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Alert } from "react-native";
import { SafeAreaView } from "@/components/Themed";
import { Header } from "@/components/Header";
import { Typography } from "@/components/Typography";
import { Button } from "@/components/Button";
import { ToggleChip } from "@/components/ToggleChip";
import { useRouter, useLocalSearchParams } from "expo-router";
// import { supabase } from "@/utils/supabase";
import { useAuth } from "@/hooks/useAuth";
import { BottomButton } from "@/components/BottomButton";

// 카테고리 매핑
const CATEGORY_MAP = {
  'appliance': { label: '가전제품 수리', icon: '🔧' },
  'digital': { label: '디지털 기기 도움', icon: '📱' },
  'furniture': { label: '가구 조립/수리', icon: '🪑' },
  'clean': { label: '청소/정리', icon: '🧹' },
  'errands': { label: '심부름/장보기', icon: '🛒' },
  'companionship': { label: '말벗/동행', icon: '👥' },
  'etc': { label: '기타', icon: '✨' },
};

export default function HelperCompletePage() {
  const router = useRouter();
  const { session } = useAuth();
  const { categories, name, age, introduction, experience } = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategories = typeof categories === 'string' ? categories.split(',') : [];

  const handleSubmit = async () => {
    if (!session?.user) {
      Alert.alert('오류', '로그인이 필요합니다.');
      router.push('/auth');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Supabase 데이터 저장 코드 (주석처리)
      /*
      const { data, error } = await supabase
        .from('helper_applications')
        .insert({
          user_id: session.user.id,
          name: name as string,
          age: parseInt(age as string),
          categories: selectedCategories,
          introduction: introduction as string,
          experience: (experience as string) || null,
          status: 'pending', // 대기 상태
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error submitting helper application:', error);
        Alert.alert('오류', '신청서 제출 중 오류가 발생했습니다.');
        return;
      }
      */

      // 임시로 로컬에 저장 (실제로는 서버에 저장해야 함)
      console.log('Helper application submitted:', {
        user_id: session.user.id,
        name: name as string,
        age: parseInt(age as string),
        categories: selectedCategories,
        introduction: introduction as string,
        experience: (experience as string) || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      Alert.alert(
        '신청 완료!', 
        '도움 신청서가 성공적으로 제출되었습니다.\n검토 후 연락드리겠습니다.',
        [
          {
            text: '확인',
            onPress: () => router.push('/helper'),
          }
        ]
      );

    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('오류', '예상치 못한 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header left='back'/>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Typography variant='title' weight='bold' style={styles.title}>
          신청 내용을 확인해주세요
        </Typography>
        
        <Typography variant='body' style={styles.subtitle}>
          제출하기 전에 입력한 정보를 다시 한번 확인해주세요
        </Typography>

        <View style={styles.summaryContainer}>
          {/* 선택한 카테고리 */}
          <View style={styles.section}>
            <Typography variant='body' weight='semibold' style={styles.sectionTitle}>
              도움 가능한 항목
            </Typography>
            <View style={styles.categoriesContainer}>
              {selectedCategories.map((categoryId) => {
                const category = CATEGORY_MAP[categoryId as keyof typeof CATEGORY_MAP];
                return (
                  <ToggleChip
                    key={categoryId}
                    label={`${category.icon} ${category.label}`}
                    selected={true}
                    variant="primary"
                    size="sm"
                    disabled
                    style={styles.categoryChip}
                  />
                );
              })}
            </View>
          </View>

          {/* 개인 정보 */}
          <View style={styles.section}>
            <Typography variant='body' weight='semibold' style={styles.sectionTitle}>
              개인 정보
            </Typography>
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Typography variant='body' weight='medium'>이름:</Typography>
                <Typography variant='body'>{name}</Typography>
              </View>
              <View style={styles.infoRow}>
                <Typography variant='body' weight='medium'>나이:</Typography>
                <Typography variant='body'>{age}세</Typography>
              </View>
            </View>
          </View>

          {/* 자기소개 */}
          <View style={styles.section}>
            <Typography variant='body' weight='semibold' style={styles.sectionTitle}>
              자기소개
            </Typography>
            <View style={styles.textContainer}>
              <Typography variant='body' style={styles.textContent}>
                {introduction}
              </Typography>
            </View>
          </View>

          {/* 관련 경험 */}
          {experience && (
            <View style={styles.section}>
              <Typography variant='body' weight='semibold' style={styles.sectionTitle}>
                관련 경험
              </Typography>
              <View style={styles.textContainer}>
                <Typography variant='body' style={styles.textContent}>
                  {experience}
                </Typography>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomButton
        title={isSubmitting ? "제출 중..." : "신청서 제출하기"}
        onPress={handleSubmit}
        disabled={isSubmitting}
      />
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
    lineHeight: 20,
  },
  summaryContainer: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    opacity: 0.8,
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  textContent: {
    lineHeight: 20,
  },

});