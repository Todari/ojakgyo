import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/Typography';

type EmptyStateProps = {
  title?: string;
  subtitle?: string;
};

export function EmptyState({ title = '내용이 없습니다', subtitle }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Typography variant='title' weight='bold' style={styles.title}>{title}</Typography>
      {subtitle ? <Typography variant='body' align='center' style={styles.subtitle}>{subtitle}</Typography> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { marginBottom: 8 },
  subtitle: { opacity: 0.7 },
});


