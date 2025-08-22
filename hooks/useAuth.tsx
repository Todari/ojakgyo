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
  role?: 'senior' | 'children' | 'helper' | null;
};

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
      const { data: current } = await supabase.auth.getSession();
      const s = current.session;
      const user = s?.user;
      if (!user?.id) return;

      const nameFromMeta =
        (user.user_metadata?.nickname as string | undefined) ||
        (user.user_metadata?.name as string | undefined) ||
        (user.email ? String(user.email).split('@')[0] : undefined) ||
        '회원';

      const profileUrl =
        (user.user_metadata?.avatar_url as string | undefined) ||
        (user.user_metadata?.picture as string | undefined) ||
        null;

      // 단일 경로: 앱에서 직접 upsert 수행
      const kakaoId = String(
        (user.user_metadata?.sub as string | undefined) ||
        (user.user_metadata?.id as string | undefined) ||
        (user.user_metadata?.provider_id as string | undefined) ||
        user.id
      );

      const { data, error } = await supabase
        .from('users')
        .upsert(
          {
            supabase_user_id: user.id,
            email: (user.email as string | null) || (user.user_metadata?.email as string | null) || null,
            provider: 'kakao',
            name: nameFromMeta,
            thumbnail_url: profileUrl,
            kakao_id: kakaoId,
            last_login_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          } as any,
          { onConflict: 'supabase_user_id' } as any
        )
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('ensureUserProfile upsert 오류:', error);
      }
      if (data) {
        setProfile(data as any);
      }
    } catch (e) {
      console.error('ensureUserProfile 예외:', e);
    }
  };

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

  const updateRole = async (role: 'senior' | 'children' | 'helper') => {
    try {
      if (!profile?.id) return;
      const { error } = await supabase
        .from('users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', profile.id);
      if (error) {
        console.error('역할 업데이트 오류:', error);
        return;
      }
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