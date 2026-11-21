import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextCore';
import { supabase } from '../lib/supabase';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    // 1. Retrieve initial session from storage
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession }, error }) => {
        if (!isMounted) return;
        if (error) {
          console.error('[ApplyTrack Auth] Error reading session:', error.message);
        }
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[ApplyTrack Auth] Failed to retrieve session:', err);
        setLoading(false);
      });

    // 2. Subscribe to auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, PASSWORD_RECOVERY, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async ({ email, password }) => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client is not configured') };
    }
    return await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
  };

  const signIn = async ({ email, password }) => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client is not configured') };
    }
    return await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
  };

  const signInWithGoogle = async () => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client is not configured') };
    }
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  const resetPasswordForEmail = async (email) => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client is not configured') };
    }
    return await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  };

  const updatePassword = async (newPassword) => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client is not configured') };
    }
    return await supabase.auth.updateUser({
      password: newPassword,
    });
  };

  const resendConfirmation = async (email) => {
    if (!supabase) {
      return { error: new Error('Supabase client is not configured') };
    }
    return await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    });
  };

  const refreshSession = async () => {
    if (!supabase) {
      return { session: null, error: null };
    }
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (!error && data?.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
      return { session: data?.session, error };
    } catch (err) {
      return { session: null, error: err };
    }
  };

  const signOut = async () => {
    if (!supabase) {
      setUser(null);
      setSession(null);
      return { error: null };
    }
    const result = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    return result;
  };

  const isAdmin = Boolean(user?.app_metadata?.role === 'admin');

  const value = {
    user,
    session,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin,
    refreshSession,
    signUp,
    signIn,
    signInWithGoogle,
    resetPasswordForEmail,
    updatePassword,
    resendConfirmation,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
