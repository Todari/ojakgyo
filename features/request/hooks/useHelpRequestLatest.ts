import { useEffect, useState } from 'react';
import { getLatestByUser, HelpRequestView } from '@/features/request/services/helpRequests';

export function useHelpRequestLatest(userId?: number) {
  const [data, setData] = useState<HelpRequestView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = async () => {
    if (!userId) return null;
    setLoading(true);
    setError(null);
    try {
      const result = await getLatestByUser(userId);
      setData(result);
      return result;
    } catch (e: any) {
      setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (!userId) return;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getLatestByUser(userId);
        if (mounted) setData(result);
      } catch (e: any) {
        if (mounted) setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId]);

  return { data, loading, error, refetch: fetch };
}


