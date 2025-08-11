import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { SafeAreaView } from '@/components/Themed';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { TextArea } from '@/components/TextArea';
import { BottomButton } from '@/components/BottomButton';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function RequestDetailsPage() {
  const router = useRouter();
  const { categories } = useLocalSearchParams();
  const [details, setDetails] = useState('');

  const selectedCategories = typeof categories === 'string' ? categories.split(',') : [];

  const handleNext = () => {
    if (!details.trim()) {
      Alert.alert('알림', '추가 요청사항을 작성해주세요.');
      return;
    }

    const params = new URLSearchParams({
      categories: selectedCategories.join(','),
      details: details.trim(),
    });

    router.push(`/request/register/confirm?${params.toString()}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header left='back'/>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Typography variant='title' weight='bold' style={styles.title}>
          추가 요청사항을 작성해주세요
        </Typography>
        <Typography variant='body' style={styles.subtitle}>
          도우미가 이해하기 쉽도록 자세히 적어주세요
        </Typography>

        <View style={styles.inputGroup}>
          <TextArea
            placeholder="예) 가벼운 장보기 동행이 필요합니다. 이동이 불편하여 가까운 마트까지 도움을 받고 싶어요."
            value={details}
            onChangeText={setDetails}
            maxLength={800}
            style={styles.textArea}
          />
          <Typography variant='caption' style={styles.counter}>
            {details.length}/800
          </Typography>
        </View>
      </ScrollView>

      <BottomButton title="다음" onPress={handleNext} disabled={!details.trim()} />
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
  inputGroup: {
    gap: 8,
  },
  textArea: {
    minHeight: 140,
  },
  counter: {
    textAlign: 'right',
    opacity: 0.6,
    marginTop: 4,
  },
});


