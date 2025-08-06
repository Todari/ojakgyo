import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { supabase } from '@/utils/supabase';
// import { Session, User } from '@supabase/supabase-js';

// 카카오 사용자 정보 타입 정의
type KakaoUser = {
  id: string;
  nickname: string;
  profileImageUrl?: string;
  email?: string;
  provider: 'kakao';
};

type AuthContextType = {
  user: KakaoUser | null;
  session: any | null; // 카카오는 세션 개념이 다르므로 유연하게 처리
  loading: boolean;
  login: (userInfo: KakaoUser) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<KakaoUser | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 로그인 함수
  const login = async (userInfo: KakaoUser) => {
    try {
      // 사용자 정보를 AsyncStorage에 저장
      await AsyncStorage.setItem('kakao_user', JSON.stringify(userInfo));
      setUser(userInfo);
      setSession({ user: userInfo }); // 세션 형태로 래핑
      console.log('User logged in:', userInfo);
    } catch (error) {
      console.error('Error saving user info:', error);
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('kakao_user');
      setUser(null);
      setSession(null);
      console.log('User logged out');
    } catch (error) {
      console.error('Error removing user info:', error);
    }
  };

  // 앱 시작시 저장된 사용자 정보 불러오기
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('kakao_user');
        if (storedUser) {
          const userInfo: KakaoUser = JSON.parse(storedUser);
          setUser(userInfo);
          setSession({ user: userInfo });
          console.log('Loaded stored user:', userInfo);
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  // Supabase 인증 코드 (주석처리)
  /*
  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error.message);
      }
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  */

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};