import { useCallback, useEffect, useState } from 'react';
import type { NaverMapViewRef } from '@mj-studio/react-native-naver-map';

export type ScreenPos = { isValid: boolean; x: number; y: number };

export function useNaverMarkers<T extends { id: number; lat: number | null; lng: number | null }>(
  mapRef: React.RefObject<NaverMapViewRef | null>,
  items: T[]
) {
  const [positions, setPositions] = useState<Record<string, ScreenPos>>({});

  const updateScreenPositions = useCallback(async () => {
    if (!mapRef.current || items.length === 0) return;
    try {
      const entries = await Promise.all(
        items.map(async (row) => {
          if (row.lat == null || row.lng == null) return [String(row.id), { isValid: false, x: 0, y: 0 }] as const;
          const res = await mapRef.current!.coordinateToScreen({ latitude: row.lat as number, longitude: row.lng as number });
          const mapped: ScreenPos = { isValid: res.isValid, x: res.screenX, y: res.screenY };
          return [String(row.id), mapped] as const;
        })
      );
      const next: Record<string, ScreenPos> = {};
      entries.forEach(([id, res]) => { next[id] = res; });
      setPositions(next);
    } catch {
      // ignore
    }
  }, [items, mapRef]);

  useEffect(() => { updateScreenPositions(); }, [items, updateScreenPositions]);

  return { positions, updateScreenPositions };
}


