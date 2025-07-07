import { SafeAreaView } from "@/components/Themed";
import { Header } from "@/components/Header";
import { Typography } from "@/components/Typography";

export default function KakaoCallbackPage() {
  return (
    <SafeAreaView>
      <Header left='back'/>
      <Typography variant='title' weight='bold'>카카오 로그인 완료</Typography>
    </SafeAreaView>
  );
}