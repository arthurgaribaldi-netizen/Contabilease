'use client';

import { useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type UseAuth = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

export function useAuth(): UseAuth {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setUser(data.session?.user ?? null);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, [load]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await load();
      } finally {
        setLoading(false);
      }
    },
    [load]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    await load();
  }, [load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  return { user, session, loading, signIn, signOut, refresh };
}
