import React, { useEffect } from 'react';
import { Stack, SplashScreen, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

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
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  // 자동 리다이렉션 비활성화 - 사용자가 직접 페이지 선택할 수 있도록
  // const { session, loading } = useAuth();
  // const router = useRouter();
  // const segments = useSegments();

  // useEffect(() => {
  //   if (loading) return;

  //   const inAuthGroup = segments[0] === 'auth';

  //   if (session && !inAuthGroup) {
  //     router.replace('/helper');
  //   } else if (!session) {
  //     router.replace('/auth');
  //   }
  // }, [session, loading, segments]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth/index" options={{ headerShown: false }} />
      <Stack.Screen name="auth/callback/kakao/index" options={{ headerShown: false }} />
      <Stack.Screen name="helper/index" options={{ headerShown: false }} />
      <Stack.Screen name="helper/map/index" options={{ headerShown: false }} />
      <Stack.Screen name="helper/register/index" options={{ headerShown: false }} />
      <Stack.Screen name="helper/register/introduction" options={{ headerShown: false }} />
      <Stack.Screen name="helper/register/complete" options={{ headerShown: false }} />
              <Stack.Screen name="helper/edit/index" options={{ headerShown: false }} />
            <Stack.Screen name="children/index" options={{ headerShown: false }} />
            <Stack.Screen name="request/index" options={{ headerShown: false }} />
            <Stack.Screen name="request/register/index" options={{ headerShown: false }} />
            <Stack.Screen name="request/register/details" options={{ headerShown: false }} />
            <Stack.Screen name="request/register/confirm" options={{ headerShown: false }} />
            <Stack.Screen name="request/edit/index" options={{ headerShown: false }} />
    </Stack>
  );
}
