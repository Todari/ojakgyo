import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

// 사용자 정보 타입 정의 (카카오 + Supabase)
type Profile = {
  id?: number;
  supabase_user_id?: string;
  kakao_id?: string;
  name?: string;
  email: string;
  thumbnail_url: string | null;
  provider?: 'kakao';
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
};

type AuthContextType = {
  session: any | null;
  loading: boolean;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  profile: null,
  refreshProfile: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const refreshProfile = async () => {
    try {
      const { data: current } = await supabase.auth.getSession();
      const currentUserId = current.session?.user?.id;
      if (!currentUserId) {
        setProfile(null);
        return;
      }
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('supabase_user_id', currentUserId)
        .maybeSingle();
      if (error) {
        console.error('프로필 조회 오류:', error);
        return;
      }
      setProfile(data ?? null);
    } catch (e) {
      console.error('프로필 로드 오류:', e);
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setProfile(null);
      console.log('사용자 로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  // Supabase 세션 초기화 및 구독
  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('세션 로드 오류:', error.message);
      }
      setSession(data.session);
      setLoading(false);
      if (data.session?.user) {
        await refreshProfile();
      }
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          await refreshProfile();
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, profile, refreshProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};