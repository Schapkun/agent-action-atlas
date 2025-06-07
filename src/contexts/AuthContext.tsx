
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle successful signup
        if (event === 'SIGNED_UP' && session?.user) {
          console.log('User signed up successfully:', session.user.email);
          
          // Try to find and accept any pending invitations for this email
          try {
            const { data: invitations, error } = await supabase
              .from('user_invitations')
              .select('*')
              .eq('email', session.user.email)
              .is('accepted_at', null);

            if (error) {
              console.error('Error fetching invitations:', error);
            } else if (invitations && invitations.length > 0) {
              console.log('Found pending invitations:', invitations);
              
              // Mark all pending invitations as accepted
              const { error: updateError } = await supabase
                .from('user_invitations')
                .update({ accepted_at: new Date().toISOString() })
                .eq('email', session.user.email)
                .is('accepted_at', null);

              if (updateError) {
                console.error('Error accepting invitations:', updateError);
              } else {
                console.log('Successfully accepted invitations for:', session.user.email);
              }
            }
          } catch (error) {
            console.error('Error handling invitations after signup:', error);
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    console.log('Attempting signup for:', email);
    
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
      console.error('Signup error:', error);
    } else {
      console.log('Signup request sent successfully');
    }
    
    return { error };
  };

  const signOut = async () => {
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
