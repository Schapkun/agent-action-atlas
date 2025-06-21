
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    console.log('[AuthContext] Manually refreshing session...');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('[AuthContext] Error refreshing session:', error);
        return;
      }
      console.log('[AuthContext] Session refreshed:', session ? 'Found' : 'Not found');
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('[AuthContext] Error in refreshSession:', error);
    }
  };

  useEffect(() => {
    console.log('[AuthContext] Initializing auth state...');
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[AuthContext] Initial session:', session ? 'Found' : 'Not found');
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('[AuthContext] Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AuthContext] Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      console.log('[AuthContext] Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array

  const signIn = async (email: string, password: string) => {
    console.log('[AuthContext] Signing in user:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (data.session) {
      console.log('[AuthContext] Sign in successful');
      setSession(data.session);
      setUser(data.session.user);
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('[AuthContext] Signing up user:', email);
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (data.session) {
      console.log('[AuthContext] Sign up successful');
      setSession(data.session);
      setUser(data.session.user);
    }
    
    return { error };
  };

  const signOut = async () => {
    console.log('[AuthContext] Signing out user');
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
