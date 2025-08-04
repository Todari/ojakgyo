import { SafeAreaView } from "@/components/Themed";
import { Header } from "@/components/Header";
import { Typography } from "@/components/Typography";
import { Button } from "@/components/Button";
import { supabase } from "@/utils/supabase";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

export default function AuthPage() {
  const handleKakaoLogin = async () => {
    const supabaseRedirectUrl = "https://oecdktjwwbqtoewyabgr.supabase.co/auth/v1/callback";
    console.log("Supabase Redirect URL (for Kakao):", supabaseRedirectUrl);

    const appDeepLinkUrl = Linking.createURL("auth/callback/kakao");
    console.log("App Deep Link URL (for WebBrowser return):", appDeepLinkUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: supabaseRedirectUrl,
        skipBrowserRedirect: true, // 브라우저 리다이렉트를 건너뛰고 URL을 반환받음
      },
    });

    if (error) {
      console.error("Error during Kakao login:", error.message);
      return;
    }

    if (data.url) {
      console.log("Supabase OAuth URL (to open in browser):", data.url);
      const result = await WebBrowser.openAuthSessionAsync(data.url, appDeepLinkUrl);
      console.log("WebBrowser result:", result);
    } else {
      console.log("No URL returned from Supabase signInWithOAuth.");
    }
  };

  return (
    <SafeAreaView>
      <Header left="back" />
      <Typography variant="title" weight="bold">
        로그인
      </Typography>
      <Button title="카카오로 로그인" onPress={handleKakaoLogin} />
    </SafeAreaView>
  );
};
