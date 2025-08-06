import { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Alert } from "react-native";
import { SafeAreaView } from "@/components/Themed";
import { Header } from "@/components/Header";
import { Typography } from "@/components/Typography";
import { Button } from "@/components/Button";
import { ToggleChip } from "@/components/ToggleChip";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/hooks/useAuth";
import { BottomButton } from "@/components/BottomButton";
import { CATEGORY_MAP, getCategoryById } from "@/constants/categories";

export default function HelperCompletePage() {
  const router = useRouter();
  const { session } = useAuth();
  const { categories, name, age, introduction, experience } = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategories = typeof categories === 'string' ? categories.split(',') : [];

  const handleSubmit = async () => {
    if (!session?.user?.supabaseId) {
      Alert.alert('오류', '로그인이 필요합니다.');
      router.push('/auth');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Supabase에 헬퍼 신청서 저장
      const { data, error } = await supabase
        .from('helper_applications')
        .insert({
          user_id: session.user.supabaseId,
          name: name as string,
          age: parseInt(age as string),
          categories: selectedCategories,
          introduction: introduction as string,
          experience: (experience as string) || null,
          status: 'published', // 바로 게시
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error submitting helper application:', error);
        
        // 테이블이 존재하지 않는 경우
        if (error.code === '42P01') {
          Alert.alert(
            '데이터베이스 오류', 
            'helper_applications 테이블이 존재하지 않습니다.\n\n다음 파일을 Supabase SQL Editor에서 실행해주세요:\n- supabase_migrations/create_helper_applications_table.sql\n- supabase_migrations/add_rls_policies.sql'
          );
          return;
        }
        
        // 기타 오류
        Alert.alert('오류', `신청서 제출 중 오류가 발생했습니다.\n오류 코드: ${error.code || 'Unknown'}`);
        return;
      }

      console.log('Helper application submitted successfully:', data);

      Alert.alert(
        '등록 완료!', 
        '도움 신청서가 성공적으로 등록되었습니다.\n이제 어르신들이 회원님의 프로필을 볼 수 있습니다.',
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