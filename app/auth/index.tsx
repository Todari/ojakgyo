import { SafeAreaView } from "@/components/Themed";
import { Header } from "@/components/Header";
import { Typography } from "@/components/Typography";
import { Button } from "@/components/Button";
import { useRouter } from "expo-router";
import { supabase } from "@/utils/supabase";
import {
  login,
  getProfile,
} from "@react-native-seoul/kakao-login";

export default function AuthPage() {
  const router = useRouter();

  const handleKakaoLogin = async () => {
    try {
      await login();
      const profile = await getProfile();

      const { data, error } = await supabase.rpc('upsert_user', {
        p_kakao_id: profile.id,
        p_name: profile.nickname,
        p_profile_url: profile.profileImageUrl,
        p_thumbnail_url: profile.thumbnailImageUrl,
        p_last_login_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error upserting user", error);
        return;
      }

      console.log("User upserted:", data);

      // Navigate to the main screen
      router.replace("/");
    } catch (err: any) {
      if (err.code === 'E_CANCELLED_OPERATION') return; // User cancelled
      console.warn(err);
    }
  };

  return (
    <SafeAreaView>
      <Header left='back'/>
      <Typography variant='title' weight='bold'>로그인</Typography>
      <Button title="카카오로 로그인" onPress={handleKakaoLogin}/>
    </SafeAreaView>
  );
}
