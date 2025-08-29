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


