import React from 'react';
import { View } from 'react-native';
import { ToggleChip } from '@/components/ToggleChip';
import { HELP_CATEGORIES } from '@/constants/categories';

type Props = {
  selected: string[];
  onToggle: (id: string) => void;
  size?: 'sm' | 'md';
};

export function CategoryChips({ selected, onToggle, size = 'sm' }: Props) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {HELP_CATEGORIES.map((c) => (
        <ToggleChip key={c.id} label={c.displayTitle || c.label} selected={selected.includes(c.id)} onPress={() => onToggle(c.id)} size={size} variant='primary' />
      ))}
    </View>
  );
}


