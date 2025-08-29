import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export function useAuthGuard() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === 'auth';
    if (!session && !inAuthGroup) {
      router.replace('/auth');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)/home');
    }
  }, [session, loading, segments]);
}


