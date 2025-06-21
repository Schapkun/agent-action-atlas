
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

  useEffect(() => {
    console.log('AuthProvider - Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('AuthProvider - Auth state changed:', { event, session });
        console.log('AuthProvider - Session user:', session?.user);
        console.log('AuthProvider - Session expires at:', session?.expires_at);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('AuthProvider - Initial session check:', { session, error });
      console.log('AuthProvider - Initial session user:', session?.user);
      
      if (error) {
        console.error('AuthProvider - Error getting session:', error);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider - Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  // Debug current auth state
  useEffect(() => {
    console.log('AuthProvider - Current state:', {
      user: user?.id ? `${user.email} (${user.id})` : null,
      session: session ? 'exists' : 'null',
      loading
    });
  }, [user, session, loading]);

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider - Signing in:', email);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('AuthProvider - Sign in error:', error);
    } else {
      console.log('AuthProvider - Sign in successful');
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    console.log('AuthProvider - Signing up:', email);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (error) {
      console.error('AuthProvider - Sign up error:', error);
    } else {
      console.log('AuthProvider - Sign up successful');
    }
    
    return { error };
  };

  const signOut = async () => {
    console.log('AuthProvider - Signing out');
    await supabase.auth.signOut();
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
