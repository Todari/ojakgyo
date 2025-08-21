import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "@/components/Themed";
import { Header } from "@/components/Header";
import { Typography } from "@/components/Typography";
import { Button } from "@/components/Button";
// import { supabase } from "@/utils/supabase";
// import * as Linking from "expo-linking";
// import * as WebBrowser from "expo-web-browser";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import Constants from 'expo-constants';
import { supabase } from "@/utils/supabase";

import { useAuth } from '@/hooks/useAuth';
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from 'expo-auth-session';

export default function AuthPage() {
  const router = useRouter();
  const { session } = useAuth();

  // 항상 OAuth 방식 사용 (네이티브 SDK 제거)
  const handleKakaoLogin = async () => {
    await handleWebOAuthLogin();
  };

  const handleWebOAuthLogin = async () => {
    try {
      console.log("=== Kakao OAuth Login Started (OAuth Only Method) ===");
      
      // 네이티브/시뮬레이터/웹 공통 리다이렉트 URI (커스텀 스킴 기반)
      const redirectUri = AuthSession.makeRedirectUri({ path: 'auth/callback/kakao' });
      
      console.log("🔍 Generated redirect URI (AuthSession):", redirectUri);
      console.log("🔍 Current execution environment:", Constants.executionEnvironment);
      
      // Supabase 설정 확인
      console.log("Supabase URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);
      console.log("Supabase Anon Key exists:", !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
      
      // 최신 OAuth 구현 방법
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: redirectUri,
          queryParams: { scope: 'account_email profile_nickname profile_image' }
        },
      });

      console.log("OAuth response data:", data);
      console.log("OAuth response error:", error);

      if (error) {
        console.error("Error during Kakao OAuth:", error.message);
        Alert.alert("로그인 오류", error.message);
        return;
      }

      if (data.url) {
        console.log("Supabase OAuth URL:", data.url);
        console.log("🔍 Full OAuth URL breakdown:");
        console.log("  - Base URL:", data.url.split('?')[0]);
        console.log("  - Query params:", data.url.split('?')[1]);
        
        // React Native에서는 WebBrowser를 사용하여 OAuth 처리
        console.log("🚀 Opening OAuth URL:", data.url);
        console.log("🚀 Using redirect URI:", redirectUri);
          
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
        
        console.log("WebBrowser result:", result);
        
        if (result.type === 'success' && result.url) {
          console.log("OAuth successful, redirecting to callback");
          console.log("Result URL:", result.url);
          
          // URL에서 code 또는 토큰(fragment) 추출
          const url = new URL(result.url);
          const code = url.searchParams.get('code');
          const error = url.searchParams.get('error');
          const errorDescription = url.searchParams.get('error_description');
          const hash = url.hash; // "#access_token=...&refresh_token=..." or empty
          let accessToken: string | null = null;
          let refreshToken: string | null = null;
          // 1) fragment 방식
          if (hash && hash.startsWith('#')) {
            const fragment = new URLSearchParams(hash.slice(1));
            accessToken = fragment.get('access_token') || accessToken;
            refreshToken = fragment.get('refresh_token') || refreshToken;
            console.log('Extracted fragment tokens:', { accessTokenExists: !!accessToken, refreshTokenExists: !!refreshToken });
          }
          // 2) querystring 방식
          if (!accessToken) accessToken = url.searchParams.get('access_token');
          if (!refreshToken) refreshToken = url.searchParams.get('refresh_token');
          if (accessToken || refreshToken) {
            console.log('Extracted query tokens:', { accessTokenExists: !!accessToken, refreshTokenExists: !!refreshToken });
          }
          
          console.log("Extracted code:", code);
          console.log("Extracted error:", error);
          console.log("Error description:", errorDescription);
          
          if (error) {
            console.error("OAuth error:", error, errorDescription);
            Alert.alert("로그인 오류", `인증 과정에서 오류가 발생했습니다: ${errorDescription || error}`);
            return;
          }
          
          if (code) {
            // 공식 문서에 따른 코드 교환
            const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (exchangeError) {
              console.error("Error exchanging code for session:", exchangeError);
              Alert.alert("로그인 오류", exchangeError.message);
              return;
            }
            
            if (sessionData.session) {
              console.log("Session created successfully:", sessionData.session.user);
              
              // 사용자 정보를 Supabase에 저장
              await saveUserToDatabase(sessionData.session.user);
              
              Alert.alert("로그인 성공", "카카오 로그인이 완료되었습니다.");
              router.replace('/');
            } else {
              console.log("No session created");
              Alert.alert("로그인 오류", "세션을 생성할 수 없습니다.");
            }
          } else if (accessToken && refreshToken) {
            // 모바일/네이티브에서는 해시(fragment)로 토큰이 반환될 수 있음 → 수동 세션 설정
            const { data: setData, error: setErr } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (setErr) {
              console.error('Error setting session from fragment tokens:', setErr);
              Alert.alert('로그인 오류', setErr.message);
              return;
            }
            const authUser = setData?.session?.user;
            if (authUser) {
              await saveUserToDatabase(authUser);
              Alert.alert('로그인 성공', '카카오 로그인이 완료되었습니다.');
              router.replace('/');
            } else {
              Alert.alert('로그인 오류', '세션을 생성할 수 없습니다.');
            }
          }
        } else if (result.type === 'cancel') {
          console.log("User cancelled the OAuth flow");
          Alert.alert("로그인 취소", "로그인이 취소되었습니다.");
        } else {
          console.log("WebBrowser result type:", result.type);
          Alert.alert("로그인 오류", "인증 과정에서 문제가 발생했습니다.");
        }
      } else {
        console.log("No OAuth URL returned");
        Alert.alert("로그인 오류", "OAuth URL을 받지 못했습니다.");
      }
      
    } catch (error) {
      console.error("Kakao login error:", error);
      Alert.alert("로그인 오류", "카카오 로그인 중 오류가 발생했습니다.");
    } finally {
      // iOS에서 웹 인증 쿠키가 남아 재인증/로그아웃 충돌을 유발하는 케이스 감소
      try { await WebBrowser.dismissBrowser(); } catch {}
      // 일부 환경에서만 존재하는 API 대비: 존재 여부 체크 후 호출
      try { (WebBrowser as any).coolDownAsync && await (WebBrowser as any).coolDownAsync(); } catch {}
    }
  };

  const saveUserToDatabase = async (user: any) => {
    try {
      // 사용자 정보를 users 테이블에 저장/업데이트
      const kakaoId = String(
        user.user_metadata?.sub ||
        user.user_metadata?.id ||
        user.user_metadata?.provider_id ||
        user.id
      );
      const { data, error } = await supabase
        .from('users')
        .upsert({
          // Supabase auth user.id를 사용하여 고유 식별자로 설정
          supabase_user_id: user.id,
          email: user.email || user.user_metadata?.email || null,
          provider: 'kakao',
          updated_at: new Date().toISOString(),
          // OAuth에서 받은 사용자 메타데이터
          name: user.user_metadata?.nickname || user.user_metadata?.name,
          thumbnail_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          kakao_id: kakaoId,
          // 기본 위치 설정 (서울)
          lat: 37.5519,
          lng: 126.9918,
          last_login_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }, { onConflict: 'supabase_user_id' });

      if (error) {
        console.error("Error saving user to database:", error);
      } else {
        console.log("User saved to database successfully");
      }
    } catch (error) {
      console.error("Error in saveUserToDatabase:", error);
    }
  };



  if (session) {
    // 이미 로그인된 상태면 홈으로
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header left="back" />
      
      <View style={styles.content}>
        <Typography variant="title" weight="bold" style={styles.title}>
          로그인
        </Typography>
        
        <Typography variant='body' style={styles.subtitle}>
          카카오 계정으로 간편하게 로그인하세요
        </Typography>

        {/* <Typography variant='caption' style={styles.platformInfo}>
          🌐 OAuth 방식 (모든 환경 지원)
        </Typography> */}

        <View style={styles.buttonContainer}>
          <Button 
            title="카카오로 로그인" 
            onPress={handleKakaoLogin} 
          />
        </View>
      </View>
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
    marginBottom: 16,
    opacity: 0.7,
  },
  platformInfo: {
    marginBottom: 32,
    opacity: 0.6,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 16,
  },
});