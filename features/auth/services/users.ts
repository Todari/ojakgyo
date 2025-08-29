import { supabase } from '@/utils/supabase';

export type Profile = {
  id?: number;
  supabase_user_id?: string;
  kakao_id?: string;
  name?: string;
  email: string | null;
  thumbnail_url: string | null;
  provider?: 'kakao';
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
  role?: 'senior' | 'children' | 'helper' | null;
};

export async function upsertFromCurrentSession(): Promise<Profile | null> {
  const { data: current } = await supabase.auth.getSession();
  const s = current.session;
  const user = s?.user;
  if (!user?.id) return null;

  const nameFromMeta =
    (user.user_metadata?.nickname as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    (user.email ? String(user.email).split('@')[0] : undefined) ||
    '회원';

  const profileUrl =
    (user.user_metadata?.avatar_url as string | undefined) ||
    (user.user_metadata?.picture as string | undefined) ||
    null;

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
    console.error('users.upsertFromCurrentSession 오류:', error);
    return null;
  }

  return (data as unknown) as Profile | null;
}

export async function fetchProfileByCurrentSession(): Promise<Profile | null> {
  const { data: current } = await supabase.auth.getSession();
  const currentUserId = current.session?.user?.id;
  if (!currentUserId) return null;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('supabase_user_id', currentUserId)
    .maybeSingle();
  if (error) {
    console.error('users.fetchProfileByCurrentSession 오류:', error);
    return null;
  }
  return (data as unknown) as Profile | null;
}

export async function updateRoleById(userId: number, role: 'senior' | 'children' | 'helper'): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) {
    console.error('users.updateRoleById 오류:', error);
    return false;
  }
  return true;
}


