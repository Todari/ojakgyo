import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { fetchProfileByCurrentSession, upsertFromCurrentSession, updateRoleById, type Profile } from '@/features/auth/services/users';

// Profile 타입은 서비스 계층 정의를 그대로 사용

type AuthContextType = {
  session: any | null;
  loading: boolean;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  updateRole: (role: 'senior' | 'children' | 'helper') => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  profile: null,
  refreshProfile: async () => {},
  logout: async () => {},
  updateRole: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  // 로그인 직후 public.users를 단일 경로로 생성/업데이트
  const ensureUserProfile = async () => {
    try {
      const p = await upsertFromCurrentSession();
      if (p) setProfile(p);
    } catch (e) {
      console.error('ensureUserProfile 예외:', e);
    }
  };

  const refreshProfile = async () => {
    try {
      const p = await fetchProfileByCurrentSession();
      setProfile(p ?? null);
    } catch (e) {
      console.error('프로필 로드 오류:', e);
    }
  };

  const updateRole = async (role: 'senior' | 'children' | 'helper') => {
    try {
      if (!profile?.id) return;
      const ok = await updateRoleById(profile.id, role);
      if (!ok) return;
      await refreshProfile();
    } catch (e) {
      console.error('역할 업데이트 중 예외:', e);
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
        await ensureUserProfile();
        await refreshProfile();
      }
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          await ensureUserProfile();
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
    <AuthContext.Provider value={{ session, loading, profile, refreshProfile, logout, updateRole }}>
      {children}
    </AuthContext.Provider>
  );
};