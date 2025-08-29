import React, { useEffect } from 'react';
import { Stack, Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

WebBrowser.maybeCompleteAuthSession();

// Kakao가 토큰을 쿼리스트링으로 붙여줄 때도 안전하게 처리
Linking.addEventListener('url', ({ url }) => {
  try {
    const parsed = new URL(url);
    if (parsed.pathname?.includes('/auth/callback/kakao')) {
      console.log('Deep link received:', url);
    }
  } catch {}
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PretendardBlack: require('../assets/fonts/PretendardBlack.ttf'),
    PretendardBold: require('../assets/fonts/PretendardBold.ttf'),
    PretendardExtraBold: require('../assets/fonts/PretendardExtraBold.ttf'),
    PretendardExtraLight: require('../assets/fonts/PretendardExtraLight.ttf'),
    PretendardLight: require('../assets/fonts/PretendardLight.ttf'),
    PretendardMedium: require('../assets/fonts/PretendardMedium.ttf'),
    PretendardRegular: require('../assets/fonts/PretendardRegular.ttf'),
    PretendardSemiBold: require('../assets/fonts/PretendardSemiBold.ttf'),
    PretendardThin: require('../assets/fonts/PretendardThin.ttf'),
  });

  const [queryClient] = React.useState(() => new QueryClient());

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <RootLayoutNav />
        </ErrorBoundary>
      </QueryClientProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
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

  // 루트는 Slot만 두고, 그룹별 레이아웃에서 렌더
  return <Slot />;
}
