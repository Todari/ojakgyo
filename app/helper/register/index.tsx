import { useState } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { SafeAreaView } from "@/components/Themed";
import { Header } from "@/components/Header";
import { Typography } from "@/components/Typography";
import { Button } from "@/components/Button";
import { useRouter } from "expo-router";
import { ToggleChip } from "@/components/ToggleChip";
import { BottomButton } from "@/components/BottomButton";
import { HELP_CATEGORIES } from "@/constants/categories";

export default function HelperRegisterPage() {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleNext = () => {
    if (selectedCategories.length === 0) {
      alert('최소 하나의 카테고리를 선택해주세요.');
      return;
    }
    
    // 선택된 카테고리를 쿼리 파라미터로 전달
    const categoriesParam = selectedCategories.join(',');
    router.push(`/helper/register/introduction?categories=${categoriesParam}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header left='back'/>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Typography variant='title' weight='bold' style={styles.title}>
          어르신들에게 도와줄 수 있는{'\n'}항목들을 선택하세요
        </Typography>
        
        <Typography variant='body' style={styles.subtitle}>
          여러 항목을 선택할 수 있어요
        </Typography>

        <View style={styles.categoriesContainer}>
          {HELP_CATEGORIES.map((category) => (
            <View key={category.id} style={styles.categoryItem}>
              <ToggleChip
                label={`${category.icon} ${category.label}`}
                selected={selectedCategories.includes(category.id)}
                onPress={() => handleCategoryToggle(category.id)}
                variant="primary"
                size="md"
                style={styles.chip}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomButton
        title={`다음 (${selectedCategories.length}개 선택)`}
        onPress={handleNext}
        disabled={selectedCategories.length === 0}
      />
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
    marginTop:8,
    marginBottom: 8,
    lineHeight: 32,
  },
  subtitle: {
    marginBottom: 32,
    opacity: 0.7,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryItem: {
    marginBottom: 4,
  },
  chip: {
    alignSelf: 'flex-start',
  },

});