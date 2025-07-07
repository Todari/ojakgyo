import React from 'react';
import { Button } from '@/components/Button';
import { useRouter } from 'expo-router';
import { Header } from '@/components/Header';
import { SafeAreaView } from '@/components/Themed';

export default function Home() {

  const router = useRouter();

  return (
    <SafeAreaView>
      <Header left='logo'/>
      <Button title="Auth로 이동" onPress={() => router.push('/auth')}/>
      <Button
        title="Children으로 이동"
        onPress={() => router.push('/children')}
      />
      <Button
        title="Helper로 이동"
        variant="secondary"
        onPress={() => router.push('/helper')}
      />
    </SafeAreaView>
  );
}