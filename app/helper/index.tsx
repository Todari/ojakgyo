import React from 'react';
import { SafeAreaView } from '@/components/Themed';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { Categories } from '@/components/Categories';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/Typography';

export default function HelperPage() {
  const router = useRouter();

  return (
    <SafeAreaView>
      <Header left='back'/>
      <Typography variant='title' weight='bold'>도움이 필요하신 분들을 찾아볼까요?</Typography>
      <Button title="지도에서 어르신 찾기" onPress={() => router.push('/helper/map')}/>
      <Categories />
      <Button title="직접 도우미 등록하기" onPress={() => router.push('/helper/register')} variant="secondary"/>
    </SafeAreaView>
  );
}
