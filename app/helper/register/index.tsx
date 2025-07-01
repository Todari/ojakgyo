import { StyleSheet } from "react-native";
import { SafeAreaView } from "@/components/Themed";
import { Header } from "@/components/Header";
import { Typography } from "@/components/Typography";
import { useRouter } from "expo-router";
import { Input } from "@/components/Input";
import { ToggleChip } from "@/components/ToggleChip";

export default function HelperRegisterPage() {
  const router = useRouter();

  return (
    <SafeAreaView>
      <Header left='back'/>
      <Typography variant='title' weight='bold'>자기소개를 작성해 주세요</Typography>
      <ToggleChip label="도우미" selected={true} />
      <Input />
    </SafeAreaView>
  );
} 