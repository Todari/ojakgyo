import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

type LoadingOverlayProps = {
  visible: boolean;
};

export function LoadingOverlay({ visible }: LoadingOverlayProps) {
  if (!visible) return null;
  return (
    <View style={styles.overlay} pointerEvents="none">
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


