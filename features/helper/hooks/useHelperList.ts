import { useEffect, useState } from 'react';
import { listHelperApplications, type HelperApplicationListRow } from '@/features/helper/services/helperApplications';

export function useHelperList() {
  const [rows, setRows] = useState<HelperApplicationListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listHelperApplications();
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


