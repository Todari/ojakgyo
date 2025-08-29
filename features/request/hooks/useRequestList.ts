import { useEffect, useMemo, useState } from 'react';
import { listRequests, type HelpRequestListRow } from '@/features/request/services/helpRequests';
import { useQuery } from '@tanstack/react-query';

export function useRequestList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['help_requests', 'list'],
    queryFn: async () => {
      const rows = await listRequests();
      return rows;
    },
  });

  const rows = data ?? [];

  const filterBy = (selected: string[]) => {
    if (selected.length === 0) return rows;
    return rows.filter((r) => (r.categories || []).some((c) => selected.includes(c)));
  };

  return { rows, loading: isLoading, error: error as any, refetch, filterBy };
}


