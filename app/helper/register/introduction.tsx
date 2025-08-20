import React, { useState } from "react";
import { StyleSheet, ScrollView, View, Alert } from "react-native";
import { SafeAreaView } from "@/components/Themed";
import { Header } from "@/components/Header";
import { Typography } from "@/components/Typography";
import { Button } from "@/components/Button";
import { TextArea } from "@/components/TextArea";
import { Input } from "@/components/Input";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from '@/hooks/useAuth';
import { BottomButton } from "@/components/BottomButton";

export default function HelperIntroductionPage() {
  const router = useRouter();
  const { categories, lat, lng } = useLocalSearchParams();
  const { profile } = useAuth();
  const [age, setAge] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [experience, setExperience] = useState('');

  const selectedCategories = typeof categories === 'string' ? categories.split(',') : [];

  // 이름은 입력받지 않고 세션 유저 닉네임을 최종 제출 단계에서 사용하므로 여기서는 처리하지 않음

  const handleNext = () => {
    if (!age.trim()) {
      Alert.alert('알림', '나이를 입력해주세요.');
      return;
    }
    if (!introduction.trim()) {
      Alert.alert('알림', '자기소개를 작성해주세요.');
      return;
    }

    // 데이터를 쿼리 파라미터로 전달
    const params = new URLSearchParams({
      categories: selectedCategories.join(','),
      age: age.trim(),
      introduction: introduction.trim(),
      experience: experience.trim(),
      lat: typeof lat === 'string' ? lat : '',
      lng: typeof lng === 'string' ? lng : '',
    });

    router.push(`/helper/register/complete?${params.toString()}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header left='back'/>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Typography variant='title' weight='bold' style={styles.title}>
          자기소개를 작성해주세요
        </Typography>
        
        <Typography variant='body' style={styles.subtitle}>
          어르신들이 안심하고 도움을 요청할 수 있도록{'\n'}자세히 작성해주세요
        </Typography>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Typography variant='body' weight='medium' style={styles.label}>
              나이 *
            </Typography>
            <Input
              placeholder="나이를 입력해주세요"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Typography variant='body' weight='medium' style={styles.label}>
              자기소개 *
            </Typography>
            <TextArea
              placeholder="본인을 소개해주세요. 성격, 취미, 특기 등을 자유롭게 작성해주세요."
              value={introduction}
              onChangeText={setIntroduction}
              maxLength={500}
              style={styles.textArea}
            />
            <Typography variant='caption' style={styles.counter}>
              {introduction.length}/500
            </Typography>
          </View>

          <View style={styles.inputGroup}>
            <Typography variant='body' weight='medium' style={styles.label}>
              관련 경험 (선택)
            </Typography>
            <TextArea
              placeholder="선택한 카테고리와 관련된 경험이 있다면 작성해주세요."
              value={experience}
              onChangeText={setExperience}
              maxLength={300}
              style={styles.textArea}
            />
            <Typography variant='caption' style={styles.counter}>
              {experience.length}/300
            </Typography>
          </View>
        </View>
      </ScrollView>

      <BottomButton
        title="완료하기"
        onPress={handleNext}
        disabled={!age.trim() || !introduction.trim()}
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
    marginTop:8,
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
    opacity: 0.7,
    lineHeight: 20,
  },
  formContainer: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    marginBottom: 4,
  },
  textArea: {
    minHeight: 100,
  },
  counter: {
    textAlign: 'right',
    opacity: 0.6,
    marginTop: 4,
  },

});