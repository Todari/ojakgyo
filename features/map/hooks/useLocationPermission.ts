import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export function useLocationPermission() {
  const [granted, setGranted] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const fg = await Location.requestForegroundPermissionsAsync();
        if (fg.granted) {
          try { await Location.requestBackgroundPermissionsAsync(); } catch {}
        }
        setGranted(fg.granted);
      } catch (e) {
        setError(String(e));
        setGranted(false);
      }
    })();
  }, []);

  return { granted, error };
}


