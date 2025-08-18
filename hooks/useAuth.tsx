import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/utils/supabase';

// 사용자 정보 타입 정의 (카카오 + Supabase)
type User = {
  // 카카오 정보
  kakaoId: string;
  nickname: string;
  profileImageUrl?: string;
  provider: 'kakao';
  // Supabase 정보
  supabaseId?: number;
  lat?: number;
  lng?: number;
  createdAt?: string;
  updatedAt?: string;
};

type AuthContextType = {
  user: User | null;
  session: any | null;
  loading: boolean;
  login: (kakaoId: string, nickname: string, profileImageUrl?: string) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 카카오 로그인 + Supabase 연동 함수
  const login = async (kakaoId: string, nickname: string, profileImageUrl?: string) => {
    try {
      console.log('=== Supabase 연동 시작 ===');
      console.log('카카오 ID:', kakaoId);
      console.log('닉네임:', nickname);

      // 1. 기존 사용자 확인 (kakao_id 컬럼으로 검색)
      const { data: existingUsers, error: searchError } = await supabase
        .from('users')
        .select('*')
        .eq('kakao_id', kakaoId) // 카카오 ID로 직접 검색
        .eq('provider', 'kakao')
        .limit(1);

      if (searchError) {
        console.error('사용자 검색 오류:', searchError);
        throw searchError;
      }

      let supabaseUser;

      if (existingUsers && existingUsers.length > 0) {
        // 2-1. 기존 사용자 - 로그인
        supabaseUser = existingUsers[0];
        console.log('기존 사용자 로그인:', supabaseUser);

        // 마지막 로그인 시간 및 닉네임 업데이트
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            name: nickname, // 카카오 닉네임 업데이트
            last_login_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', supabaseUser.id);

        if (updateError) {
          console.error('로그인 시간 업데이트 오류:', updateError);
        }
      } else {
        // 2-2. 신규 사용자 - 회원가입
        console.log('신규 사용자 회원가입');
        
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            kakao_id: kakaoId, // 카카오 ID를 kakao_id 컬럼에 저장
            name: nickname, // 카카오 닉네임을 name 컬럼에 저장
            provider: 'kakao',
            lat: 37.5519, // 기본 위치 (서울)
            lng: 126.9918,
            thumbnail_url: profileImageUrl || null, // 프로필 이미지 URL
            last_login_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error('사용자 생성 오류:', insertError);
          throw insertError;
        }

        supabaseUser = newUser;
        console.log('신규 사용자 생성 완료:', supabaseUser);
      }

      // 3. 통합 사용자 정보 생성
      const userInfo: User = {
        kakaoId: supabaseUser.kakao_id, // DB의 kakao_id 필드 사용
        nickname: supabaseUser.name || nickname, // DB의 name 필드 우선 사용, 없으면 카카오 닉네임
        profileImageUrl: supabaseUser.thumbnail_url || profileImageUrl, // DB 또는 카카오 이미지
        provider: 'kakao',
        supabaseId: supabaseUser.id,
        lat: supabaseUser.lat,
        lng: supabaseUser.lng,
        createdAt: supabaseUser.created_at,
        updatedAt: supabaseUser.updated_at
      };

      // 4. 로컬 저장 및 상태 업데이트
      await AsyncStorage.setItem('user_info', JSON.stringify(userInfo));
      setUser(userInfo);
      setSession({ user: userInfo });
      
      console.log('=== 로그인/회원가입 완료 ===');
      console.log('사용자 정보:', userInfo);

    } catch (error) {
      console.error('로그인/회원가입 오류:', error);
      throw error;
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user_info');
      setUser(null);
      setSession(null);
      console.log('사용자 로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  // 앱 시작시 저장된 사용자 정보 불러오기
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user_info');
        if (storedUser) {
          const userInfo: User = JSON.parse(storedUser);
          setUser(userInfo);
          setSession({ user: userInfo });
          console.log('저장된 사용자 정보 로드:', userInfo);
        }
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
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