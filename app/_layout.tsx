import React, { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';

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

  return <Stack>
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="auth/index" options={{ headerShown: false }} />
    <Stack.Screen name="auth/callback/kakao" options={{ headerShown: false }} />
    <Stack.Screen name="helper/index" options={{ headerShown: false }} />
    <Stack.Screen name="helper/map/index" options={{ headerShown: false }} />
    <Stack.Screen name="helper/register/index" options={{ headerShown: false }} />
    <Stack.Screen name="children/index" options={{ headerShown: false }} />
  </Stack>;
}
