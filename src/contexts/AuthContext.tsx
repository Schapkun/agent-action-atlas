
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
  const [initialized, setInitialized] = useState(false);

  const updateSession = async (newSession: Session | null) => {
    console.log('[AuthContext] Updating session:', newSession ? 'Session found' : 'No session');
    setSession(newSession);
    setUser(newSession?.user ?? null);
    
    if (newSession) {
      console.log('[AuthContext] User ID:', newSession.user.id);
      console.log('[AuthContext] Access token available:', !!newSession.access_token);
      
      try {
        await supabase.auth.setSession({
          access_token: newSession.access_token,
          refresh_token: newSession.refresh_token
        });
        console.log('[AuthContext] Session set successfully on Supabase client');
      } catch (error) {
        console.error('[AuthContext] Error setting session on Supabase client:', error);
      }
    }
  };

  const refreshSession = async () => {
    if (!initialized) return;
    
    console.log('[AuthContext] Manually refreshing session...');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('[AuthContext] Error refreshing session:', error);
        return;
      }
      await updateSession(session);
    } catch (error) {
      console.error('[AuthContext] Error in refreshSession:', error);
    }
  };

  useEffect(() => {
    console.log('[AuthContext] Initializing auth state...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] Auth state changed:', event, session ? 'Session exists' : 'No session');
        await updateSession(session);
        
        if (!initialized) {
          setLoading(false);
          setInitialized(true);
        }
      }
    );

    // Check for existing session only once
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('[AuthContext] Initial session check:', session ? 'Session found' : 'No session');
      await updateSession(session);
      setLoading(false);
      setInitialized(true);
    }).catch((error) => {
      console.error('[AuthContext] Error getting initial session:', error);
      setLoading(false);
      setInitialized(true);
    });

    return () => {
      console.log('[AuthContext] Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []); // Only run once on mount

  const signIn = async (email: string, password: string) => {
    console.log('[AuthContext] Signing in user:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (data.session) {
      console.log('[AuthContext] Sign in successful, updating session');
      await updateSession(data.session);
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
      console.log('[AuthContext] Sign up successful, updating session');
      await updateSession(data.session);
    }
    
    return { error };
  };

  const signOut = async () => {
    console.log('[AuthContext] Signing out user');
    await supabase.auth.signOut();
    await updateSession(null);
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
