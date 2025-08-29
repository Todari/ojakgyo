import { useEffect, useMemo, useState } from 'react';
import { listRequests, type HelpRequestListRow } from '@/features/request/services/helpRequests';

export function useRequestList() {
  const [rows, setRows] = useState<HelpRequestListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listRequests();
      setRows(data);
    } catch (e: any) {
      setError(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const filterBy = (selected: string[]) => {
    if (selected.length === 0) return rows;
    return rows.filter((r) => (r.categories || []).some((c) => selected.includes(c)));
  };

  return { rows, loading, error, refetch: fetch, filterBy };
}


