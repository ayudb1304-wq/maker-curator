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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Send welcome email on first login after verification
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            await maybeSendWelcomeEmail(session.user);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const maybesendWelcomeEmail = async (user: any) => {
    try {
      // Check if user has a profile and if welcome email was already sent
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, display_name, welcome_email_sent')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile && !profile.welcome_email_sent) {
        // Send welcome email
        await supabase.functions.invoke('send-welcome-email', {
          body: { 
            email: user.email, 
            username: profile.username, 
            displayName: profile.display_name 
          },
        });

        // Mark welcome email as sent
        await supabase
          .from('profiles')
          .update({ welcome_email_sent: true })
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Welcome email error:', error);
    }
  };

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