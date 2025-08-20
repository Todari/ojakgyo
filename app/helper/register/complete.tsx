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
  const { profile } = useAuth();
  const { categories, name, age, introduction, experience, lat, lng } = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategories = typeof categories === 'string' ? categories.split(',') : [];

  const handleSubmit = async () => {
    if (!profile?.id) {
      Alert.alert('오류', '로그인이 필요합니다.');
      router.push('/auth');
      return;
    }

    setIsSubmitting(true);
    
      try {
        // payload 구성 (lat/lng 포함 시도)
        const payloadWithLocation: any = {
          user_id: profile.id,
          name: (name as string) || (profile.name as string) || '이름 미설정',
          age: parseInt(age as string),
          categories: selectedCategories,
          introduction: introduction as string,
          experience: (experience as string) || null,
          status: 'published',
          created_at: new Date().toISOString(),
        };
        const latNum = lat ? parseFloat(lat as string) : NaN;
        const lngNum = lng ? parseFloat(lng as string) : NaN;
        if (Number.isFinite(latNum) && Number.isFinite(lngNum)) {
          payloadWithLocation.lat = latNum;
          payloadWithLocation.lng = lngNum;
        }

        const { error: firstError } = await supabase
          .from('helper_applications')
          .insert(payloadWithLocation);

        if (firstError) {
          console.error('Error submitting helper application:', firstError);

          // lat/lng 컬럼이 없을 때 재시도 (PGRST204: schema cache에 컬럼 없음)
          if (firstError.code === 'PGRST204' || firstError.message?.includes("'lat' column")) {
            const { error: retryError } = await supabase
              .from('helper_applications')
              .insert({
                user_id: profile.id,
                name: (name as string) || (profile.name as string) || '이름 미설정',
                age: parseInt(age as string),
                categories: selectedCategories,
                introduction: introduction as string,
                experience: (experience as string) || null,
                status: 'published',
                created_at: new Date().toISOString(),
              });

            if (retryError) {
              if (retryError.code === '42P01') {
                Alert.alert(
                  '데이터베이스 오류',
                  'helper_applications 테이블이 존재하지 않습니다.\n\n다음 파일을 Supabase SQL Editor에서 실행해주세요:\n- supabase_migrations/create_helper_applications_table.sql\n- supabase_migrations/add_rls_policies.sql'
                );
                return;
              }
              Alert.alert('오류', `신청서 제출 중 오류가 발생했습니다.\n오류 코드: ${retryError.code || 'Unknown'}`);
              return;
            }

            Alert.alert(
              '등록 완료!',
              '도움 신청서가 등록되었습니다.\n단, 위치 정보 컬럼(lat/lng)이 데이터베이스에 없어 위치는 저장되지 않았습니다.\n관리자에게 위치 컬럼 추가를 요청해주세요.',
              [
                { text: '확인', onPress: () => router.push('/helper') },
              ]
            );
            return;
          }

          // 테이블이 존재하지 않는 경우
          if (firstError.code === '42P01') {
            Alert.alert(
              '데이터베이스 오류',
              'helper_applications 테이블이 존재하지 않습니다.\n\n다음 파일을 Supabase SQL Editor에서 실행해주세요:\n- supabase_migrations/create_helper_applications_table.sql\n- supabase_migrations/add_rls_policies.sql'
            );
            return;
          }

          // 기타 오류
          Alert.alert('오류', `신청서 제출 중 오류가 발생했습니다.\n오류 코드: ${firstError.code || 'Unknown'}`);
          return;
        }

      console.log('Helper application submitted successfully');

      Alert.alert('등록 완료!', '도움 신청서가 성공적으로 등록되었습니다.\n이제 어르신들이 회원님의 프로필을 볼 수 있습니다.', [
        { text: '확인', onPress: () => router.push('/helper') },
      ]);

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
              {/* <View style={styles.infoRow}>
                <Typography variant='body' weight='medium'>이름:</Typography>
                <Typography variant='body'>{name}</Typography>
              </View> */}
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