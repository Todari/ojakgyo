import React, { useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from '@/components/Themed';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { Button } from '@/components/Button';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';

type ChatMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export default function ChatRoomPage() {
  const { id, other } = useLocalSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [otherUser, setOtherUser] = useState<{ id: number; name?: string | null; thumbnail_url?: string | null } | null>(null);
  const [otherName, setOtherName] = useState<string | null>(null);
  const [otherHelperId, setOtherHelperId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const roomId = String(id);

    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });
        if (error) return;
        setMessages((data as unknown as ChatMessage[]) || []);
      } catch {}
    };
    fetch();

    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` }, (payload: any) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    const loadOtherUser = async () => {
      if (!id || !profile?.id) return;
      try {
        const roomId = String(id);
        let hintedOther = other ? Number(Array.isArray(other) ? other[0] : other) : undefined;
        const { data: room, error: roomErr } = await supabase
          .from('chat_rooms')
          .select('id, participants, room_key')
          .eq('id', Number(roomId))
          .maybeSingle();
        if (roomErr) {
          console.error('load room error', roomErr);
          return;
        }
        const myId = Number(profile.id);
        let otherId: number | undefined;
        if (!otherId && hintedOther && hintedOther !== myId) {
          otherId = hintedOther;
        }
        if (room?.room_key && typeof room.room_key === 'string') {
          const [a, b] = room.room_key.split(':').map((t: string) => Number(t));
          const ids = [a, b].filter((n) => Number.isFinite(n)) as number[];
          otherId = ids.find((n) => n !== myId);
        }
        if (!otherId) {
          const participants: number[] = (room?.participants || []).map((n: any) => Number(n));
          otherId = participants.find((pid) => pid !== myId);
        }
        if (!otherId) {
          const { data: lastMsg } = await supabase
            .from('chat_messages')
            .select('sender_id')
            .eq('room_id', Number(roomId))
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          const candidate = Number((lastMsg as any)?.sender_id);
          if (candidate && candidate !== myId) otherId = candidate;
        }
        if (!otherId) {
          console.warn('other user id could not be resolved');
          return;
        }

        const { data: userRow, error: userErr } = await supabase
          .from('users')
          .select('id, name, thumbnail_url')
          .eq('id', otherId)
          .maybeSingle();
        if (userErr) {
          console.error('load other user error', userErr);
        }
        if (userRow) setOtherUser(userRow as any);

        const { data: helperRow, error: helperErr } = await supabase
          .from('helper_applications')
          .select('id, name')
          .eq('user_id', otherId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (helperErr) {
          console.error('load other helper error', helperErr);
        }
        if (helperRow?.id != null) setOtherHelperId(String(helperRow.id));
        const displayName = (helperRow as any)?.name || (userRow as any)?.name || (otherId ? `사용자 ${otherId}` : null);
        if (displayName) setOtherName(displayName);
      } catch (e) {
        console.error('loadOtherUser unexpected', e);
      }
    };
    loadOtherUser();
  }, [id, profile?.id]);

  const send = async () => {
    if (!text.trim()) return;
    if (!profile?.id) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }
    const roomId = String(id);
    const content = text.trim();
    setText('');
    const { error } = await supabase
      .from('chat_messages')
      .insert({ room_id: roomId, sender_id: profile.id, content, created_at: new Date().toISOString() });
    if (error) {
      Alert.alert('오류', '메시지 전송 실패');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        left='back'
        title={otherName ?? otherUser?.name ?? '상대방'}
        avatarUrl={otherUser?.thumbnail_url || null}
        onTitlePress={otherHelperId ? () => router.push(`/helper/${otherHelperId}`) : undefined}
        onBackPress={() => router.replace('/(tabs)/chat')}
      />
      
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          style={{ flex: 1 }}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const mine = Number(item.sender_id) === Number(profile?.id);
            return (
              <View style={[styles.bubble, mine ? styles.bubbleMe : styles.bubbleOther]}>
                <Typography variant='body'>{item.content}</Typography>
              </View>
            );
          }}
          contentContainerStyle={{ padding: 16, gap: 8 }}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder='메시지를 입력하세요'
          />
          <Button title='보내기' onPress={send} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  otherBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  otherAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E5E7EB' },
  bubble: { padding: 12, borderRadius: 12, maxWidth: '80%' },
  bubbleMe: { backgroundColor: '#DCFCE7', alignSelf: 'flex-end' },
  bubbleOther: { backgroundColor: '#F3F4F6', alignSelf: 'flex-start' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, height: 44 },
});


