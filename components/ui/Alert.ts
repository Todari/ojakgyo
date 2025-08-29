import { Alert } from 'react-native';
import { userAlertMessage } from '@/utils/logger';

export function showError(title: string, message: string) {
  Alert.alert(title, userAlertMessage(message));
}

export function showInfo(title: string, message: string, onPress?: () => void) {
  Alert.alert(title, userAlertMessage(message), onPress ? [{ text: '확인', onPress }] : undefined);
}


