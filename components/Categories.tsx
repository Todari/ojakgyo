import { View, StyleSheet, Image } from "react-native";
import { Typography } from '@/components/Typography';
import { HELP_CATEGORIES } from '@/constants/categories';

// 카테고리별 이미지 매핑
const CATEGORY_IMAGES = {
  digital: require('@/assets/images/category/digital.png'),
  furniture: require('@/assets/images/category/furniture.png'),
  appliance: require('@/assets/images/category/appliance.png'),
  clean: require('@/assets/images/category/clean.png'),
  companionship: require('@/assets/images/category/companionship.png'),
  errands: require('@/assets/images/category/errands.png'),
  etc: require('@/assets/images/category/etc.png'),
};

// 카테고리 테이블 (상수에서 생성)
const CATEGORY_TABLE = HELP_CATEGORIES.reduce((acc, category) => {
  acc[category.id as keyof typeof CATEGORY_IMAGES] = {
    order: category.order!,
    image: CATEGORY_IMAGES[category.id as keyof typeof CATEGORY_IMAGES],
    title: category.displayTitle!
  };
  return acc;
}, {} as Record<keyof typeof CATEGORY_IMAGES, { order: number; image: any; title: string }>);

type CategoryType = keyof typeof CATEGORY_TABLE;

interface CategoryProps {
  type: CategoryType;
}

function Category({ type }: CategoryProps) {
  return (
    <View style={styles.categoryContainer}>
      <Image source={CATEGORY_TABLE[type].image} style={styles.categoryImage} />
      <View style={styles.categoryTextContainer}>
        <Typography
          variant='body'
          align='center'
          color='default'
          weight='bold'
          numberOfLines={2}
        >
          {CATEGORY_TABLE[type].title}
        </Typography>
      </View>
    </View>
  );
}

const MAX_ROWS = 4;

export function Categories() {
  const originKeys = Object.keys(CATEGORY_TABLE).sort((a,b): number => {
    return CATEGORY_TABLE[a as CategoryType].order - CATEGORY_TABLE[b as CategoryType].order;
  })
  const categoryKeys = Array.from({length: Math.floor(originKeys.length / MAX_ROWS) + 1}).map((_, index) => 
    originKeys.slice(index * MAX_ROWS, (index + 1) * MAX_ROWS)
  )

  return (
    <View style={styles.categoriesContainer}>
      {categoryKeys.map((keys, index) => (
        <View style={styles.categoryRow} key={index}>
          {Array.from({length: MAX_ROWS}).map((_, colIdx) => (
            keys[colIdx]
              ? <Category key={keys[colIdx]} type={keys[colIdx] as CategoryType} />
              : <View key={`empty-${index}-${colIdx}`} style={styles.categoryTextContainer} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  categoriesContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  categoryRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryImage: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  categoryTextContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
    width: 80,
    minHeight: 40,
  },
});