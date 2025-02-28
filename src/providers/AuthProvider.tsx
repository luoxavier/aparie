
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { signInWithIdentifier } from "@/services/auth";
import { AuthContextType } from "@/types/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const mountedRef = useRef(false);
  const initCalled = useRef(false);
  
  // Add render counter for debugging
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  console.log('AuthProvider rendering, count:', renderCount.current);

  // Only run this effect once on mount
  useEffect(() => {
    if (initCalled.current) return;
    
    console.log('AuthProvider mounting effect running');
    initCalled.current = true;
    mountedRef.current = true;

    // Single initial session check
    const initSession = async () => {
      console.log('Initializing session check');
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Session check result:', currentSession ? 'Session found' : 'No session');
        
        if (currentSession && mountedRef.current) {
          setSession(currentSession);
          setUser(currentSession.user);
          if (window.location.pathname === '/login') {
            console.log('Redirecting from login to home after session init');
            navigate('/');
          }
        }
      } catch (error) {
        console.error('Session init error:', error);
        setAuthError(error instanceof Error ? error : new Error('Unknown authentication error'));
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          console.log('Session initialization complete, loading set to false');
        }
      }
    };

    initSession();

    // Set up auth state change listener (only once)
    console.log('Setting up auth state change listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession) => {
        console.log('Auth state change event:', event);
        if (!mountedRef.current) {
          console.log('Component unmounted, ignoring auth state change');
          return;
        }

        if (event === 'SIGNED_IN') {
          console.log('User signed in, updating state');
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setAuthError(null); // Clear any previous errors on successful sign-in
          queryClient.invalidateQueries({ queryKey: ['profile'] });
          if (window.location.pathname === '/login') {
            console.log('Redirecting from login to home after sign in');
            navigate('/');
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing state');
          setSession(null);
          setUser(null);
          queryClient.clear();
          if (window.location.pathname !== '/login') {
            console.log('Redirecting to login after sign out');
            navigate('/login');
          }
        }
      }
    );

    return () => {
      console.log('AuthProvider unmounting, cleaning up');
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures this only runs once

  const signOut = async () => {
    try {
      console.log('Attempting to sign out');
      await supabase.auth.signOut();
      console.log('Sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthError(error instanceof Error ? error : new Error('Error signing out'));
    }
  };

  const updateStreak = async () => {
    if (!user) return;
    
    try {
      // This is a simplified implementation to reduce excessive calls
      const { error } = await supabase.rpc('update_user_streak');
      if (error) throw error;
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const signUp = async (email: string, password: string, username: string, displayName: string, isTestAccount: boolean = false) => {
    try {
      console.log('Attempting to sign up user:', email);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: displayName,
            is_test_account: isTestAccount,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        setAuthError(error);
        throw error;
      }
      console.log('Sign up successful');
    } catch (error) {
      console.error('Error during sign up:', error);
      setAuthError(error instanceof Error ? error : new Error('Error during sign up'));
      throw error;
    }
  };

  const signIn = async (identifier: string, password: string) => {
    try {
      console.log('Attempting to sign in user:', identifier);
      await signInWithIdentifier(identifier, password);
      console.log('Sign in successful');
      setAuthError(null); // Clear any previous errors on successful sign-in
    } catch (error) {
      console.error('Error during sign in:', error);
      setAuthError(error instanceof Error ? error : new Error('Error during sign in'));
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    authError,
    signOut,
    updateStreak,
    signIn,
    signUp,
  };

  console.log('AuthProvider state:', { 
    hasUser: !!user, 
    hasSession: !!session, 
    hasError: !!authError, 
    isLoading: loading 
  });

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  console.log('Rendering children with auth context');
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
