import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Button, ButtonProps } from './Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomButtonProps extends ButtonProps {
  containerStyle?: ViewStyle;
  safeArea?: boolean; // SafeArea 적용 여부
}

export function BottomButton({ 
  containerStyle, 
  safeArea = true, 
  ...buttonProps 
}: BottomButtonProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View 
      style={[
        styles.container, 
        safeArea && { paddingBottom: Math.max(insets.bottom, 20) },
        containerStyle
      ]}
    >
      <Button {...buttonProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: 'white',
    // 그림자 효과 (선택사항)
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: -2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    elevation: 8,
  },
});