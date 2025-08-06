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
import { login, getProfile, KakaoOAuthToken, KakaoProfile } from '@react-native-seoul/kakao-login';
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const handleKakaoLogin = async () => {
    try {
      console.log("=== Kakao Native Login Started ===");
      
      // 네이티브 카카오 로그인
      const token: KakaoOAuthToken = await login();
      console.log("Kakao login success:", token);

      // 사용자 프로필 정보 가져오기
      const profile: KakaoProfile = await getProfile();
      console.log("Kakao profile:", profile);

      // 사용자 정보를 Auth Context에 저장
      const userInfo = {
        id: profile.id.toString(), // number를 string으로 변환
        nickname: profile.nickname,
        profileImageUrl: profile.profileImageUrl,
        email: profile.email,
        provider: 'kakao' as const,
      };

      await authLogin(userInfo);

      // 상태 업데이트가 완료될 때까지 잠시 대기
      setTimeout(() => {
        router.replace('/');
      }, 100);

    } catch (error) {
      console.error("Kakao login error:", error);
      Alert.alert("로그인 오류", "카카오 로그인 중 오류가 발생했습니다.");
    }
  };

  // Supabase OAuth 코드 (주석처리)
  /*
  const handleKakaoLogin = async () => {
    try {
      console.log("=== Kakao OAuth Login Started ===");
      
      // Supabase 설정 확인
      console.log("Supabase URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);
      console.log("Supabase Anon Key exists:", !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
      
      // 공식 문서에 따른 OAuth 구현
      // https://supabase.com/docs/guides/auth/social-login/auth-kakao
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: Linking.createURL("auth/callback/kakao"),
          queryParams: {
            // 이메일 권한 추가 (Supabase 요구사항)
            scope: 'account_email profile_nickname profile_image'
          }
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
        
        // React Native에서는 WebBrowser를 사용하여 OAuth 처리
        const result = await WebBrowser.openAuthSessionAsync(
          data.url, 
          Linking.createURL("auth/callback/kakao")
        );
        
        console.log("WebBrowser result:", result);
        
        if (result.type === 'success' && result.url) {
          console.log("OAuth successful, redirecting to callback");
          console.log("Result URL:", result.url);
          
          // URL에서 코드 추출
          const url = new URL(result.url);
          const code = url.searchParams.get('code');
          const error = url.searchParams.get('error');
          const errorDescription = url.searchParams.get('error_description');
          
          console.log("Extracted code:", code);
          console.log("Extracted error:", error);
          console.log("Error description:", errorDescription);
          
          if (error) {
            console.error("OAuth error:", error, errorDescription);
            
            // 이메일 오류가 발생하면 사용자에게 알림
            if (error === 'server_error' && errorDescription?.includes('email')) {
              Alert.alert(
                "로그인 오류", 
                "카카오에서 이메일 정보를 가져올 수 없습니다. 카카오 개발자 포털에서 이메일 권한을 활성화하거나, 다른 방법으로 로그인해주세요."
              );
              return;
            }
            
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
            } else {
              console.log("No session created");
              Alert.alert("로그인 오류", "세션을 생성할 수 없습니다.");
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
    }
  };

  const saveUserToDatabase = async (user: any) => {
    try {
      // 사용자 정보를 profiles 테이블에 저장/업데이트
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          provider: 'kakao',
          updated_at: new Date().toISOString(),
          // OAuth에서 받은 사용자 메타데이터
          nickname: user.user_metadata?.nickname || user.user_metadata?.name,
          profile_image: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          kakao_id: user.user_metadata?.sub || user.user_metadata?.id,
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error("Error saving user to database:", error);
      } else {
        console.log("User saved to database successfully");
      }
    } catch (error) {
      console.error("Error in saveUserToDatabase:", error);
    }
  };
  */

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

        <View style={styles.buttonContainer}>
          <Button title="카카오로 로그인" onPress={handleKakaoLogin} />
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
    marginBottom: 32,
    opacity: 0.7,
  },
  buttonContainer: {
    gap: 16,
  },
});