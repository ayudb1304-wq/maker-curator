import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    let isMounted = true;

    // This function runs once to get the initial session state.
    async function getInitialSession() {
      const { data: { session } } = await supabase.auth.getSession();

      // We only update the state if the component is still mounted.
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        // Crucially, we set loading to false only AFTER the first session check is done.
        setIsLoading(false);
      }
    }

    getInitialSession();

    // This listener handles all subsequent auth events (SIGN_IN, SIGN_OUT, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      }
    );

    // The cleanup function runs when the component unmounts.
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    // Use the current domain to prevent phishing warnings
    const currentOrigin = window.location.origin;
    const redirectUrl = `${currentOrigin}/dashboard`; // Redirect to dashboard after verification
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata || {},
        captchaToken: undefined // Explicitly set to prevent security warnings
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    // Use the current domain to prevent phishing warnings
    const currentOrigin = window.location.origin;
    const redirectUrl = `${currentOrigin}/auth?reset=true`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
      captchaToken: undefined // Explicitly set to prevent security warnings
    });
    return { error };
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};