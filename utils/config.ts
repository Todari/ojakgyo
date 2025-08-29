import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra || {}) as Record<string, any>;

export const Config = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || extra.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || extra.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  NAVER_KEY_ID: process.env.EXPO_PUBLIC_NAVER_MAPS_KEY_ID || extra.EXPO_PUBLIC_NAVER_MAPS_KEY_ID,
  NAVER_KEY: process.env.EXPO_PUBLIC_NAVER_MAPS_KEY || extra.EXPO_PUBLIC_NAVER_MAPS_KEY,
};


