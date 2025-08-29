import { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Alert } from "react-native";
import { SafeAreaView } from "@/components/Themed";
import { Header } from "@/components/Header";
import { Typography } from "@/components/Typography";
import { Button } from "@/components/Button";
import { ToggleChip } from "@/components/ToggleChip";
import { BottomButton } from "@/components/BottomButton";
import { HELP_CATEGORIES } from "@/constants/categories";
import { TextArea } from "@/components/TextArea";
import { Input } from "@/components/Input";
import { useRouter } from "expo-router";
import { useHelperApplication } from "@/features/helper/hooks/useHelperApplication";
import { useAuth } from "@/hooks/useAuth";

type RequestStatus = 'published' | 'private';

interface HelperApplication {
  id: string;
  age: number;
  categories: string[];
  introduction: string;
  experience?: string;
  status: RequestStatus;
}

export default function HelperEditPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [application, setApplication] = useState<HelperApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [age, setAge] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [experience, setExperience] = useState('');
  const [status, setStatus] = useState<RequestStatus>('published');

  const userId = typeof profile?.id === 'number' ? profile?.id : undefined;
  const { data, loading: fetching, update, remove } = useHelperApplication(userId);

  useEffect(() => {
    setLoading(fetching);
    if (data) {
      setApplication(data as any);
      const app = data as HelperApplication;
      setSelectedCategories(app.categories || []);
      setAge(app.age?.toString() || '');
      setIntroduction(app.introduction || '');
      setExperience(app.experience || '');
      setStatus(app.status || 'published');
    }
  }, [fetching, data]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => (
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    ));
  };

  const handleSave = async () => {
    if (!application) return;
    if (selectedCategories.length === 0) { Alert.alert('필수 입력', '도움 가능한 항목을 하나 이상 선택해주세요.'); return; }
    if (!age.trim() || isNaN(parseInt(age))) { Alert.alert('필수 입력', '올바른 나이를 입력해주세요.'); return; }
    if (!introduction.trim()) { Alert.alert('필수 입력', '자기소개를 입력해주세요.'); return; }

    setSaving(true);
    try {
      await update(Number(application.id), {
        age: parseInt(age),
        categories: selectedCategories,
        introduction: introduction.trim(),
        experience: experience.trim() || null,
        status: status,
      });

      Alert.alert('수정 완료!', '신청서가 성공적으로 수정되었습니다.', [{ text: '확인', onPress: () => router.back() }]);
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('오류', '예상치 못한 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!application) return;
    Alert.alert(
      '신청서 삭제',
      '정말로 신청서를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제', style: 'destructive', onPress: async () => {
            try {
              await remove(Number(application.id));
              Alert.alert('삭제 완료', '신청서가 삭제되었습니다.', [{ text: '확인', onPress: () => router.back() }]);
            } catch (error) {
              console.error('Unexpected error:', error);
              Alert.alert('오류', '예상치 못한 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header left='back' />
        <View style={styles.content}>
          <Typography variant='title' weight='bold' style={styles.title}>로딩 중...</Typography>
        </View>
      </SafeAreaView>
    );
  }

  if (!application) {
    return (
      <SafeAreaView style={styles.container}>
        <Header left='back' />
        <View style={styles.content}>
          <Typography variant='title' weight='bold' style={styles.title}>신청서를 찾을 수 없습니다</Typography>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header left='back' />
      <ScrollView contentContainerStyle={styles.content}>
        <Typography variant='title' weight='bold' style={styles.title}>신청서 수정</Typography>
        <Typography variant='body' style={styles.subtitle}>등록된 신청서를 수정하거나 공개 상태를 변경할 수 있습니다.</Typography>

        <View style={styles.section}>
          <Typography variant='body' weight='semibold' style={styles.sectionTitle}>공개 상태</Typography>
          <View style={styles.statusChips}>
            <ToggleChip label="게시" selected={status === 'published'} onPress={() => setStatus('published')} style={styles.statusChip} />
            <ToggleChip label="비공개" selected={status === 'private'} onPress={() => setStatus('private')} style={styles.statusChip} />
          </View>
        </View>

        <View style={styles.section}>
          <Typography variant='body' weight='semibold' style={styles.sectionTitle}>도움 가능한 항목 *</Typography>
          <View style={styles.categoriesContainer}>
            {HELP_CATEGORIES.map((category) => (
              <ToggleChip key={category.id} label={category.label} selected={selectedCategories.includes(category.id)} onPress={() => handleCategoryToggle(category.id)} style={styles.categoryChip} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Input label="나이 *" value={age} onChangeText={setAge} placeholder="나이를 입력해주세요" keyboardType="numeric" style={styles.input} />
        </View>

        <View style={styles.section}>
          <TextArea label="자기소개 *" value={introduction} onChangeText={setIntroduction} placeholder="본인을 소개해주세요. 어떤 도움을 드릴 수 있는지 알려주세요." style={styles.input} />
        </View>

        <View style={styles.section}>
          <TextArea label="관련 경험 (선택사항)" value={experience} onChangeText={setExperience} placeholder="관련 경험이 있다면 간단히 작성해주세요." style={styles.input} />
        </View>

        <View style={styles.section}>
          <Button title="신청서 삭제" onPress={handleDelete} variant="secondary" style={StyleSheet.flatten([styles.button, styles.deleteButton])} />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
      <BottomButton title={saving ? "저장 중..." : "수정 완료"} onPress={handleSave} disabled={saving} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingBottom: 64 },
  title: { marginTop: 8, marginBottom: 8 },
  subtitle: { marginBottom: 32, opacity: 0.7 },
  section: { marginBottom: 24 },
  sectionTitle: { marginBottom: 12, color: '#374151' },
  statusChips: { flexDirection: 'row', gap: 8 },
  statusChip: { flex: 1 },
  categoriesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { marginBottom: 8 },
  input: { marginBottom: 16 },
  button: { width: '100%' },
  deleteButton: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  bottomSpacing: { height: 20 },
});


