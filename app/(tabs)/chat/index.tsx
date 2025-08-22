import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from '@/components/Themed';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';

type ChatRoom = { id: number; participants: number[] | any[]; room_key?: string | null };
type ChatMessage = { id: string; room_id: number | string; sender_id: number | string; content: string; created_at: string };
type UserRow = { id: number; name?: string | null; thumbnail_url?: string | null };
type RoomItem = { roomId: number; otherId: number | null; displayName: string; avatarUrl: string | null; lastMessage?: ChatMessage };

export default function ChatListPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [latestByRoom, setLatestByRoom] = useState<Record<number, ChatMessage | undefined>>({});
  const [usersMap, setUsersMap] = useState<Record<number, UserRow | undefined>>({});
  const myId = useMemo(() => (profile?.id ? Number(profile.id) : null), [profile?.id]);

  useEffect(() => { if (!authLoading && !myId) setLoading(false); }, [authLoading, myId]);

  const resolveOtherId = useCallback((room: ChatRoom): number | null => {
    if (!myId) return null;
    if (room.room_key && typeof room.room_key === 'string') {
      const [a, b] = room.room_key.split(':').map((t) => Number(t));
      const ids = [a, b].filter((n) => Number.isFinite(n)) as number[];
      const other = ids.find((n) => n !== myId);
      if (other) return other;
    }
    const participants = (room.participants || []).map((n: any) => Number(n));
    const other = participants.find((pid) => pid !== myId);
    return other ?? null;
  }, [myId]);

  const formatTime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso); const now = new Date();
    const sameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    return sameDay ? `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}` : `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const buildItems = useMemo<RoomItem[]>(() => {
    return rooms.map((room) => {
      const otherId = resolveOtherId(room);
      const u = otherId ? usersMap[otherId] : undefined;
      const displayName = (u?.name && String(u.name)) || (otherId ? `사용자 ${otherId}` : '대화 상대');
      const avatarUrl = (u?.thumbnail_url as string | null) ?? null;
      const last = latestByRoom[Number(room.id)];
      return { roomId: Number(room.id), otherId: otherId ?? null, displayName, avatarUrl, lastMessage: last };
    }).sort((a, b) => {
      const ta = a.lastMessage?.created_at ? new Date(a.lastMessage.created_at).getTime() : 0;
      const tb = b.lastMessage?.created_at ? new Date(b.lastMessage.created_at).getTime() : 0;
      return tb - ta;
    });
  }, [rooms, usersMap, latestByRoom, resolveOtherId]);

  const fetchRooms = useCallback(async () => {
    if (!myId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('id, participants, room_key')
        .contains('participants', [myId])
        .order('id', { ascending: false });
      if (error) { setRooms([]); return; }
      const roomRows = (data as unknown as ChatRoom[]) || [];
      setRooms(roomRows);

      const roomIds = roomRows.map((r) => Number(r.id)).filter(Boolean);
      if (roomIds.length > 0) {
        const { data: msgs, error: msgErr } = await supabase
          .from('chat_messages')
          .select('id, room_id, sender_id, content, created_at')
          .in('room_id', roomIds)
          .order('created_at', { ascending: false });
        if (!msgErr && msgs) {
          const latest: Record<number, ChatMessage> = {};
          for (const m of msgs as any as ChatMessage[]) {
            const rid = Number(m.room_id);
            if (!latest[rid]) latest[rid] = m;
          }
          setLatestByRoom(latest);
        } else { setLatestByRoom({}); }
      } else { setLatestByRoom({}); }

      const otherIds = Array.from(new Set(roomRows.map(resolveOtherId).filter((v): v is number => typeof v === 'number')));
      if (otherIds.length > 0) {
        const { data: users, error: usersErr } = await supabase
          .from('users')
          .select('id, name, thumbnail_url')
          .in('id', otherIds);
        if (!usersErr && users) {
          const map: Record<number, UserRow> = {};
          for (const u of users as any as UserRow[]) map[Number(u.id)] = u;
          setUsersMap(map);
        } else { setUsersMap({}); }
      } else { setUsersMap({}); }
    } finally { setLoading(false); }
  }, [myId, resolveOtherId]);

  useEffect(() => { if (myId) fetchRooms(); }, [myId, fetchRooms]);
  useFocusEffect(useCallback(() => { if (myId) fetchRooms(); }, [myId, fetchRooms]));

  useEffect(() => {
    const channel = supabase
      .channel('chat_list')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload: any) => {
        const newMsg = payload.new as ChatMessage;
        setLatestByRoom((prev) => {
          const rid = Number(newMsg.room_id);
          const prevMsg = prev[rid];
          if (!prevMsg || new Date(newMsg.created_at) > new Date(prevMsg.created_at)) return { ...prev, [rid]: newMsg };
          return prev;
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const renderItem = ({ item }: { item: RoomItem }) => (
    <Pressable style={styles.row} onPress={() => router.push(`/chat/${item.roomId}${item.otherId ? `?other=${item.otherId}` : ''}`)}>
      <View style={styles.avatar}>{item.avatarUrl ? (<Image source={{ uri: item.avatarUrl }} style={styles.avatarImg} />) : null}</View>
      <View style={styles.center}>
        <Typography variant='subtitle' weight='semibold' truncate>{item.displayName}</Typography>
        <Typography variant='caption' color='secondary' truncate>{item.lastMessage?.content ?? '대화를 시작해보세요'}</Typography>
      </View>
      <View style={styles.right}>
        <Typography variant='label' color='secondary'>{formatTime(item.lastMessage?.created_at)}</Typography>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header left='logo' />
      {authLoading || loading ? (
        <View style={styles.loading}><ActivityIndicator /></View>
      ) : (
        <FlatList
          data={buildItems}
          keyExtractor={(it) => String(it.roomId)}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={buildItems.length === 0 ? styles.emptyContainer : { paddingVertical: 8 }}
          ListEmptyComponent={<View style={styles.empty}><Typography variant='body' color='secondary' align='center'>진행 중인 채팅이 없습니다.</Typography></View>}
        />
      )}
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 44;
const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, backgroundColor: '#E5E7EB', marginRight: 12, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  center: { flex: 1, gap: 2 },
  right: { marginLeft: 8, alignItems: 'flex-end' },
  separator: { height: 1, backgroundColor: '#E5E7EB', marginLeft: 16 + AVATAR_SIZE + 12 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center', padding: 32 },
  empty: { alignItems: 'center' },
});


