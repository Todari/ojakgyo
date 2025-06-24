import React, { useEffect } from 'react';
import { User } from '@/types/model';
import { Text } from '@/components/Themed';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NaverMapMarkerOverlay, NaverMapView, NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import * as Location from 'expo-location'
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUsers } from '@/hooks/useUsers';

export default function Map() {
  const navigation = useNavigation();
  const { users, isLoading, error } = useUsers();

  useEffect(() => {
    (async () => {
      try {
        const {granted} = await Location.requestForegroundPermissionsAsync();
        /**
         * Note: Foreground permissions should be granted before asking for the background permissions
         * (your app can't obtain background permission without foreground permission).
         */
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
  const mapType = 'Basic';

  const mapRef = React.useRef<NaverMapViewRef>(null);

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
        {isLoading && <Text>로딩 중...</Text>}
        {error && <Text>에러가 발생했습니다.</Text>}
        {users && users.map((user: User) => (
          <NaverMapMarkerOverlay
            key={user.id}
            latitude={user.lat}
            longitude={user.lng}
            caption={{
              text: user.name,
              color: '#fff',
              haloColor: '#000',
            }}
            image={{ httpUri: user.profileUrl ?? '' }}
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
  container: { flex: 1 },
  webview: { flex: 1, backgroundColor: 'transparent' },
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
