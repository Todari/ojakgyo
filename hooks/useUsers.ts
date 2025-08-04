import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { User } from '@/types/model';
import { Alert } from 'react-native';

export function useUsers() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('users')
        .select("id, name, lat, lng")
        // .select('id, name, lat, lng')
        // .order('id', { ascending: true });
      console.log(data, error)
      if (error) {
        Alert.alert('error', error.message);
        setError(error);
        setUsers(null);
      } else if (data) {
        setUsers(
          data.map(user => ({
            id: user.id,
            name: user.name,
            lat: Number(user.lat),
            lng: Number(user.lng),
          }))
        );
      }
      setIsLoading(false);
    }
    fetchUsers();
  }, []);

  return { users, isLoading, error };
}
