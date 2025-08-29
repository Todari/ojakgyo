import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { SafeAreaView } from '@/components/Themed';

type ScreenProps = ViewProps & {
  children: React.ReactNode;
};

export function Screen({ style, children, ...rest }: ScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View {...rest} style={[styles.content, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});


