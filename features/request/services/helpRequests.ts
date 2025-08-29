import { supabase } from '@/utils/supabase';

export type RequestStatus = 'published' | 'private';

export type HelpRequestView = {
  id: number;
  title: string;
  status: RequestStatus;
  created_at: string;
  categories: string[];
};

export async function getLatestByUser(userId: number): Promise<HelpRequestView | null> {
  const { data, error } = await supabase
    .from('help_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    // PGRST116: No rows found, 42P01: relation does not exist
    if ((error as any).code === 'PGRST116' || (error as any).code === '42P01') {
      return null;
    }
    throw error;
  }

  if (!data) return null;

  return {
    id: (data as any).id as number,
    title: ((data as any).name as string | null) ?? '',
    status: (((data as any).status as string | null) === 'published' ? 'published' : 'private'),
    created_at: ((data as any).created_at as string | null) ?? new Date().toISOString(),
    categories: ((data as any).categories as string[] | null) ?? [],
  };
}

export type HelpRequestRow = {
  id: number;
  name: string | null;
  lat: number | null;
  lng: number | null;
  categories: string[];
  status?: string | null;
  users?: { thumbnail_url: string | null } | null;
};

export async function listRequestsWithLocation(): Promise<HelpRequestRow[]> {
  const { data, error } = await supabase
    .from('help_requests')
    .select('id, name, lat, lng, categories, status, users:users!help_requests_user_id_fkey(thumbnail_url)')
    .not('lat', 'is', null)
    .not('lng', 'is', null);
  if (error) throw error;
  return (data as unknown) as HelpRequestRow[];
}


