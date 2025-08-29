import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from '@/components/Themed';
import { Typography } from '@/components/Typography';
import { BottomButton } from '@/components/BottomButton';
import * as Location from 'expo-location';
import { NaverMapView, NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { useRouter } from 'expo-router';
import { Header } from '@/components/Header';

import { searchPlaces, type SearchResult } from '@/features/map/services/naverPlaces';

const DEFAULT_LAT = 37.5665; // 서울 시청
const DEFAULT_LNG = 126.9780;

export default function HelperLocationPage() {
  const router = useRouter();
  const mapRef = useRef<NaverMapViewRef>(null);

  const [lat, setLat] = useState<number>(DEFAULT_LAT);
  const [lng, setLng] = useState<number>(DEFAULT_LNG);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

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
    mapRef.current?.animateCameraTo({
      latitude: targetLat,
      longitude: targetLng,
      zoom: 15,
      duration: 350,
    });
  };

  const onCameraChanged = useCallback(({ latitude, longitude }: { latitude: number; longitude: number; }) => {
    setLat(latitude);
    setLng(longitude);
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      setSearching(true);
      const items = await searchPlaces(search.trim());
      setResults(items);
    } catch (e) {
      console.error('Search error', e);
      Alert.alert('오류', '지역 검색 중 문제가 발생했습니다.');
    } finally {
      setSearching(false);
    }
  };

  const selectResult = (r: SearchResult) => {
    animateTo(r.y, r.x);
    setResults([]);
  };

  const handleNext = () => {
    router.push(`/helper/register?lat=${lat}&lng=${lng}`);
  };

  useEffect(() => {
    (async () => {
      try {
        const {granted} = await Location.requestForegroundPermissionsAsync();
        if(granted) {
          await Location.requestBackgroundPermissionsAsync();
        }
      } catch(e) {
        console.error(`Location request has been failed: ${e}`);
      }
    })();
  }, []);
  
  const initialRegion = {
    latitude: 37.5519,
    longitude: 126.9918,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };
  const mapType = 'Basic' as const;

  return (
    <SafeAreaView style={styles.container}>
      <Header left='back' />
      <View style={styles.content}>
        <Typography variant='title' weight='bold' style={styles.title}>
          도와드릴 수 있는{'\n'}위치를 설정해주세요.
        </Typography>
        <Typography variant='body' style={styles.subtitle}>
          해당 위치 근처의 어르신들이 확인할 수 있어요.
        </Typography>
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


