import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from '@/components/Themed';
import { Typography } from '@/components/Typography';
import { BottomButton } from '@/components/BottomButton';
import * as Location from 'expo-location';
import { useLocationPermission } from '@/features/map/hooks/useLocationPermission';
import { NaverMapView, NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { useRouter } from 'expo-router';
import { Header } from '@/components/Header';

const DEFAULT_LAT = 37.5665; // 서울 시청
const DEFAULT_LNG = 126.9780;

export default function RequestLocationPage() {
  const router = useRouter();
  const mapRef = useRef<NaverMapViewRef>(null);

  const [lat, setLat] = useState<number>(DEFAULT_LAT);
  const [lng, setLng] = useState<number>(DEFAULT_LNG);

  const moveToCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      animateTo(pos.coords.latitude, pos.coords.longitude);
    } catch (e) {
      console.log('Current location fetch failed:', e);
    }
  }, []);

  const animateTo = (targetLat: number, targetLng: number) => {
    setLat(targetLat);
    setLng(targetLng);
    mapRef.current?.animateCameraTo({ latitude: targetLat, longitude: targetLng, zoom: 15, duration: 350 });
  };

  const onCameraChanged = useCallback(({ latitude, longitude }: { latitude: number; longitude: number; }) => {
    setLat(latitude);
    setLng(longitude);
  }, []);

  const perm = useLocationPermission();

  const initialRegion = { latitude: 37.5519, longitude: 126.9918, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };
  const mapType = 'Basic' as const;

  const handleNext = () => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) { Alert.alert('알림', '지도를 이동해 위치를 설정해주세요.'); return; }
    router.push(`/request/register?lat=${lat}&lng=${lng}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header left='back' />
      <View style={styles.content}>
        <Typography variant='title' weight='bold' style={styles.title}>어느 위치에서 도움이 필요하신가요?</Typography>
        <Typography variant='body' style={styles.subtitle}>핀을 이동하여 위치를 지정하세요. 다음 단계에서 도움 종류를 선택합니다.</Typography>
        <View style={styles.mapWrapper}>
          <NaverMapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={initialRegion}
            mapType={mapType}
            locale='ko'
            isExtentBoundedInKorea
            isShowLocationButton={false}
            onCameraChanged={(e: any) => onCameraChanged({ latitude: e.latitude, longitude: e.longitude })}
            onInitialized={moveToCurrentLocation}
          />
          <Pressable style={styles.myLocationFab} onPress={moveToCurrentLocation}>
            <Typography variant='caption' weight='semibold' style={{ color: 'white' }}>현위치</Typography>
          </Pressable>
          <View pointerEvents='none' style={styles.centerPin}>
            <View style={styles.pinHead} />
            <View style={styles.pinTail} />
          </View>
        </View>
      </View>
      <BottomButton title='다음' onPress={handleNext} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  title: { marginTop:8, marginBottom: 8, lineHeight: 32 },
  subtitle: { marginBottom: 32, opacity: 0.7 },
  mapWrapper: { flex: 1, marginHorizontal: -24 },
  centerPin: { position: 'absolute', top: '50%', left: '50%', marginLeft: -8, marginTop: -16, alignItems: 'center' },
  pinHead: { width: 16, height: 16, borderRadius: 16, backgroundColor: '#EF4444' },
  pinTail: { width: 2, height: 18, backgroundColor: '#EF4444' },
  myLocationFab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#111827', opacity: 0.9, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
});


