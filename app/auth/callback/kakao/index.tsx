import { SafeAreaView } from "@/components/Themed";
import { Header } from "@/components/Header";
import { Typography } from "@/components/Typography";
import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/utils/supabase";
import { Alert } from "react-native";

export default function KakaoCallbackPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Kakao callback params:", params);
        
        // URL에서 authorization code 추출
        const code = params.code as string;
        const error = params.error as string;
        const errorDescription = params.error_description as string;
        
        if (error) {
          console.error("OAuth error:", error, errorDescription);
          Alert.alert("로그인 오류", `인증 과정에서 오류가 발생했습니다: ${errorDescription || error}`);
          router.replace("/auth");
          return;
        }

        if (code) {
          console.log("Received authorization code:", code);
          
          // 공식 문서에 따른 코드 교환
          // https://supabase.com/docs/guides/auth/social-login/auth-kakao
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error("Error exchanging code for session:", exchangeError);
            Alert.alert("로그인 오류", exchangeError.message);
            router.replace("/auth");
            return;
          }

          if (data.session) {
            console.log("Auth successful:", data.session.user);
            console.log("User ID:", data.session.user.id);
            console.log("User metadata:", data.session.user.user_metadata);
            
            // 사용자 정보를 Supabase에 저장/업데이트
            await saveUserToDatabase(data.session.user);
            
            Alert.alert("로그인 성공", "카카오 로그인이 완료되었습니다.");
            router.replace("/");
          } else {
            console.log("No session created");
            Alert.alert("로그인 오류", "세션을 생성할 수 없습니다.");
            router.replace("/auth");
          }
        } else {
          console.log("No authorization code found");
          Alert.alert("로그인 오류", "인증 코드를 받지 못했습니다.");
          router.replace("/auth");
        }
      } catch (error) {
        console.error("Error in auth callback:", error);
        Alert.alert("로그인 오류", "예상치 못한 오류가 발생했습니다.");
        router.replace("/auth");
      }
    };

    const saveUserToDatabase = async (user: any) => {
      try {
        // 사용자 정보를 users 테이블에 저장/업데이트 (이메일 제외)
        const { data, error } = await supabase
          .from('users')
          .upsert({
            // Supabase auth user.id를 사용하여 고유 식별자로 설정
            supabase_user_id: user.id,
            email: user.email,
            // email 필드 제거 - 카카오에서 제공하지 않으므로 저장하지 않음
            provider: 'kakao',
            updated_at: new Date().toISOString(),
            // OAuth에서 받은 사용자 메타데이터
            name: user.user_metadata?.nickname || user.user_metadata?.name,
            thumbnail_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
            kakao_id: user.user_metadata?.sub || user.user_metadata?.id,
            last_login_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          }, {
            onConflict: 'kakao_id'
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

    handleAuthCallback();
  }, [router, params]);

  return (
    <SafeAreaView>
      <Header left='back'/>
      <Typography variant='title' weight='bold'>카카오 로그인 처리 중...</Typography>
    </SafeAreaView>
  );
}