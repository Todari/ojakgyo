import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/Typography';

type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, message: String(error?.message || error) };
  }

  componentDidCatch(error: any, info: any) {
    console.error('UI ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.wrap}>
          <Typography variant='title' weight='bold' style={{ marginBottom: 8 }}>문제가 발생했습니다</Typography>
          <Typography variant='body' align='center' style={{ opacity: 0.7 }}>{this.state.message}</Typography>
        </View>
      );
    }
    return this.props.children as any;
  }
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});


