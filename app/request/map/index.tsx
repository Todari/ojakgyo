import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NaverMapView, NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/Typography';
import { HELP_CATEGORIES } from '@/constants/categories';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';

type HelperApplicationRow = {
  id: number;
  name: string;
  lat: number | null;
  lng: number | null;
  categories: string[] | null;
  status?: string | null;
  users?: { thumbnail_url: string | null } | null;
};

type ScreenPos = { isValid: boolean; x: number; y: number };

export default function RequestMapPage() {
  const navigation = useNavigation();
  const router = useRouter();
  const mapRef = useRef<NaverMapViewRef>(null);

  const [helpers, setHelpers] = useState<HelperApplicationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<number, ScreenPos>>({});

  useEffect(() => {
    (async () => {
      try {
        const { granted } = await Location.requestForegroundPermissionsAsync();
        if (granted) {
          await Location.requestBackgroundPermissionsAsync();
        }
      } catch (e) {
        console.error(`Location request has been failed: ${e}`);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('helper_applications')
          .select('id, name, lat, lng, categories, status, users:users(thumbnail_url)')
          .not('lat', 'is', null)
          .not('lng', 'is', null);

        if (error) {
          console.error('Error fetching help requests for map:', error);
          setError('요청을 불러오는 중 오류가 발생했습니다.');
        } else if (data) {
          setHelpers((data as unknown) as HelperApplicationRow[]);
        }
      } catch (e) {
        console.error('Unexpected error:', e);
        setError('예상치 못한 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const updateScreenPositions = useCallback(async () => {
    if (!mapRef.current || helpers.length === 0) return;
    try {
      const entries = await Promise.all(
        helpers.map(async (row) => {
          const res = await mapRef.current!.coordinateToScreen({
            latitude: row.lat as number,
            longitude: row.lng as number,
          });
          // remap to ScreenPos shape
          const mapped: ScreenPos = {
            isValid: res.isValid,
            x: res.screenX,
            y: res.screenY,
          };
          return [row.id, mapped] as const;
        })
      );
      const next: Record<number, ScreenPos> = {};
      entries.forEach(([id, res]) => {
        next[id] = res;
      });
      setPositions(next);
    } catch (e) {
      // ignore
    }
  }, [helpers]);

  const initialRegion = {
    latitude: 37.5519,
    longitude: 126.9918,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };
  const mapType: any = 'Basic';

  return (
    <View style={{ flex: 1 }}>
      <NaverMapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        mapType={mapType}
        locale='ko'
        isExtentBoundedInKorea
        onInitialized={updateScreenPositions}
        onCameraChanged={updateScreenPositions}
      >
        {isLoading && <Typography variant='body' weight='bold'>로딩 중...</Typography>}
        {error && <Typography variant='body' weight='bold'>에러가 발생했습니다.</Typography>}
      </NaverMapView>

      {/* Overlay custom cards anchored to screen positions */}
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        {helpers.map((row) => {
          const pos = positions[row.id];
          if (!pos || !pos.isValid) return null;
          const CARD_WIDTH = 180;
          const CARD_HEIGHT = 64;
          const left = pos.x - CARD_WIDTH / 2;
          const top = pos.y - CARD_HEIGHT - 12; // place above the coordinate

          const categories = (row.categories || []).slice(0, 2);
          return (
            <TouchableOpacity
              key={row.id}
              activeOpacity={0.9}
              onPress={() => router.push('/helper')}
              style={[
                styles.card,
                { left, top, width: CARD_WIDTH, height: CARD_HEIGHT },
              ]}
            >
              <View style={styles.cardRow}>
                <Image
                  source={row.users?.thumbnail_url ? { uri: row.users.thumbnail_url } : require('../../../assets/images/icon.png')}
                  style={styles.avatar}
                />
                <View style={{ flex: 1 }}>
                  <Typography variant='body' weight='semibold' numberOfLines={1}>
                    {row.name}
                  </Typography>
                  <View style={styles.chipsRow}>
                    {categories.map((id) => {
                      const c = HELP_CATEGORIES.find((x) => x.id === id);
                      const label = c?.displayTitle || c?.label || id;
                      return (
                        <View key={id} style={styles.chip}>
                          <Typography variant='caption'>{label}</Typography>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderColor: '#10B981', // emerald-500
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  chip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  fab: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#333',
    opacity: 0.48,
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 10,
  },
});


