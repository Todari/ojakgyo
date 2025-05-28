import { View, StyleSheet, Image } from "react-native";
import { PretendardText } from "./StyledText";

const CATEGORY_TABLE = {
  digital: {
    order: 1,
    image: require('@/assets/images/category/digital.png'),
    title: '디지털\n도우미'
  },
  furniture: {
    order: 2,
    image: require('@/assets/images/category/furniture.png'),
    title: '가구\n설치・수리'
  },
  appliance: {
    order: 3,
    image: require('@/assets/images/category/appliance.png'),
    title: '가전제품'
  },
  clean: {
    order: 4,
    image: require('@/assets/images/category/clean.png'),
    title: '청소'
  },
  companionship: {
    order: 5,
    image: require('@/assets/images/category/companionship.png'),
    title: '말동무'
  },
  errands: {
    order: 6,
    image: require('@/assets/images/category/errands.png'),
    title: '심부름'
  },
  etc: {
    order: 7,
    image: require('@/assets/images/category/etc.png'),
    title: '기타'
  },
}

type CategoryType = keyof typeof CATEGORY_TABLE;

interface CategoryProps {
  type: CategoryType;
}

function Category({ type }: CategoryProps) {
  return (
    <View style={styles.categoryContainer}>
      <Image source={CATEGORY_TABLE[type].image} style={styles.categoryImage} />
      <View style={styles.categoryTextContainer}>
        <PretendardText style={styles.categoryText}>{CATEGORY_TABLE[type].title}</PretendardText>
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
          {Array.from({length: MAX_ROWS}).map((_, index) => (
            keys[index] ? <Category key={keys[index]} type={keys[index] as CategoryType} /> : <View style={styles.categoryTextContainer} />
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
    justifyContent: 'center',
    width: 80,
    height: 40,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
  }
});