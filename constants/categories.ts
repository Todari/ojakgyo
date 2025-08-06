// 도움 카테고리 상수 정의
export interface Category {
  id: string;
  label: string;
  icon: string;
  displayTitle?: string; // Categories 컴포넌트용 표시 제목
  order?: number; // Categories 컴포넌트용 순서
}

export const HELP_CATEGORIES: Category[] = [
  { id: 'appliance', label: '가전제품 수리', icon: '🔧', displayTitle: '가전제품', order: 3 },
  { id: 'digital', label: '디지털 기기 도움', icon: '📱', displayTitle: '디지털\n도우미', order: 1 },
  { id: 'furniture', label: '가구 조립/수리', icon: '🛋️', displayTitle: '가구\n설치・수리', order: 2 },
  { id: 'clean', label: '청소/정리', icon: '🧹', displayTitle: '청소', order: 4 },
  { id: 'errands', label: '심부름/장보기', icon: '🛍️', displayTitle: '심부름', order: 6 },
  { id: 'companionship', label: '말벗/동행', icon: '🤝', displayTitle: '말동무', order: 5 },
  { id: 'etc', label: '기타', icon: '✨', displayTitle: '기타', order: 7 },
];

// 카테고리 ID로 카테고리 정보 찾기
export const getCategoryById = (id: string): Category | undefined => {
  return HELP_CATEGORIES.find(category => category.id === id);
};

// 카테고리 ID 배열을 라벨 배열로 변환
export const getCategoryLabels = (ids: string[]): string[] => {
  return ids.map(id => getCategoryById(id)?.label || id);
};

// 카테고리 매핑 객체 (기존 코드 호환성을 위해)
export const CATEGORY_MAP = HELP_CATEGORIES.reduce((acc, category) => {
  acc[category.id] = { label: category.label, icon: category.icon };
  return acc;
}, {} as Record<string, { label: string; icon: string }>);