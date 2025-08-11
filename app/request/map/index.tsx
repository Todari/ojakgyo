import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { NaverMapMarkerOverlay, NaverMapView, NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/Typography';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';

type HelpRequestRow = {
  id: number;
  details: string;
  created_at: string;
  status: 'published' | 'private';
  users: {
    id: number;
    name: string | null;
    lat: number | null;
    lng: number | null;
    thumbnail_url: string | null;
  } | null;
};

export default function RequestMapPage() {
  const navigation = useNavigation();
  const router = useRouter();
  const mapRef = useRef<NaverMapViewRef>(null);

  const [requests, setRequests] = useState<HelpRequestRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          .from('help_requests')
          .select(`id, details, created_at, status, users:users(id, name, lat, lng, thumbnail_url)`) // implicit FK join
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching help requests for map:', error);
          setError('요청을 불러오는 중 오류가 발생했습니다.');
        } else if (data) {
          setRequests((data as unknown) as HelpRequestRow[]);
        }
      } catch (e) {
        console.error('Unexpected error:', e);
        setError('예상치 못한 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

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
      >
        {isLoading && <Typography variant='body' weight='bold'>로딩 중...</Typography>}
        {error && <Typography variant='body' weight='bold'>에러가 발생했습니다.</Typography>}
        {requests.filter(r => r.users?.lat && r.users?.lng).map((req) => (
          <NaverMapMarkerOverlay
            key={req.id}
            latitude={req.users!.lat as number}
            longitude={req.users!.lng as number}
            caption={{
              text: (req.users?.name || '요청자') as string,
              color: '#fff',
              haloColor: '#000',
            }}
            onTap={() => router.push(`/request/${req.id}`)}
          />
        ))}
      </NaverMapView>
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


