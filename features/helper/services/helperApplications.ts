import { supabase } from '@/utils/supabase';

export type HelperApplicationRow = {
  id: number;
  name: string;
  lat: number | null;
  lng: number | null;
  categories: string[];
  status?: string | null;
  users?: { thumbnail_url: string | null } | null;
};

export async function listHelpersWithLocation(): Promise<HelperApplicationRow[]> {
  const { data, error } = await supabase
    .from('helper_applications')
    .select('id, name, lat, lng, categories, status, users:users!helper_applications_user_id_fkey(thumbnail_url)')
    .not('lat', 'is', null)
    .not('lng', 'is', null);
  if (error) throw error;
  return (data as unknown) as HelperApplicationRow[];
}

export type HelperApplicationListRow = { id: number; name: string; categories: string[]; created_at: string };

export async function listHelperApplications(): Promise<HelperApplicationListRow[]> {
  const { data, error } = await supabase
    .from('helper_applications')
    .select('id, name, categories, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as unknown) as HelperApplicationListRow[];
}

export type CreateHelperApplicationInput = {
  user_id: number;
  name: string;
  age: number;
  categories: string[];
  introduction: string;
  experience?: string | null;
  lat?: number | null;
  lng?: number | null;
  status?: 'published' | 'private';
};

export async function createHelperApplication(input: CreateHelperApplicationInput): Promise<void> {
  const payload: any = {
    ...input,
    status: input.status ?? 'published',
    created_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('helper_applications').insert(payload);
  if (error) throw error;
}

export async function getLatestHelperApplicationByUser(userId: number) {
  const { data, error } = await supabase
    .from('helper_applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as any;
}

export async function updateHelperApplication(id: number, updates: Partial<CreateHelperApplicationInput>) {
  const { error } = await supabase
    .from('helper_applications')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteHelperApplication(id: number) {
  const { error } = await supabase.from('helper_applications').delete().eq('id', id);
  if (error) throw error;
}


