import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from '@/components/Themed';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { ToggleChip } from '@/components/ToggleChip';
import { HELP_CATEGORIES } from '@/constants/categories';
import { supabase } from '@/utils/supabase';

type Row = { id: number; name: string; categories: string[]; created_at: string };

export default function HelperListPage() {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const [selected, setSelected] = useState<string[]>(() => (typeof category === 'string' ? [category] : []));
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('helper_applications')
        .select('id, name, categories, created_at')
        .order('created_at', { ascending: false });
      if (!error && data) setRows(data as any);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (selected.length === 0) return rows;
    return rows.filter((r) => (r.categories || []).some((c) => selected.includes(c)));
  }, [rows, selected]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header left='back' title='도우미 목록' />

      <View style={styles.filterRow}>
        {HELP_CATEGORIES.map((c) => (
          <ToggleChip key={c.id} label={c.displayTitle || c.label} selected={selected.includes(c.id)} onPress={() => toggle(c.id)} size='sm' variant='primary' />
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/helper/${item.id}`)}>
            <Typography variant='body' weight='semibold'>{item.name}</Typography>
            <Typography variant='caption' style={{ opacity: 0.7 }}>{new Date(item.created_at).toLocaleString()}</Typography>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {(item.categories || []).map((id) => {
                const c = HELP_CATEGORIES.find((x) => x.id === id);
                return <ToggleChip key={id} label={c?.displayTitle || c?.label || id} selected size='sm' disabled />;
              })}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading ? <Typography variant='body' align='center' style={{ marginTop: 32 }}>표시할 프로필이 없습니다.</Typography> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  card: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, backgroundColor: '#fff' },
});


