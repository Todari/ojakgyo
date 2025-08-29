import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';

export function withRoleGuard<P>(Component: React.ComponentType<P>, allowed: Array<'senior' | 'children' | 'helper'>) {
  return function Guarded(props: P) {
    const { profile, loading } = useAuth();
    const router = useRouter();
    if (loading) return null;
    if (allowed.length && profile?.role && !allowed.includes(profile.role)) {
      router.replace('/(tabs)/home');
      return null;
    }
    return <Component {...props} />;
  };
}


