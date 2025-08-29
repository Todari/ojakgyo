import { useEffect, useState } from 'react';
import { deleteHelpRequest, getLatestFullByUser, updateHelpRequest } from '@/features/request/services/helpRequests';

export function useHelpRequestEdit(userId?: number) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = async () => {
    if (!userId) return null;
    setLoading(true);
    setError(null);
    try {
      const row = await getLatestFullByUser(userId);
      setData(row);
      return row;
    } catch (e: any) {
      setError(e);
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (userId) fetch(); }, [userId]);

  const update = async (id: number, updates: any) => updateHelpRequest(id, updates);
  const remove = async (id: number) => deleteHelpRequest(id);

  return { data, loading, error, refetch: fetch, update, remove };
}


