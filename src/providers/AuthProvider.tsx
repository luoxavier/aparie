
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
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

  // Initialize auth state once on mount
  useEffect(() => {
    console.log('AuthProvider: Initializing auth state');
    
    // Get current session
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log('Initial session check:', data.session ? 'Found session' : 'No session');
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
        setAuthError(error instanceof Error ? error : new Error('Failed to get initial session'));
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state change event:', event);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in, updating state');
          setAuthError(null); // Clear any previous errors
          queryClient.invalidateQueries({ queryKey: ['profile'] });
          
          // Navigate to home if on login page
          if (window.location.pathname === '/login') {
            console.log('Redirecting from login to home after sign in');
            navigate('/');
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing state');
          queryClient.clear();
          
          // Navigate to login if not already there
          if (window.location.pathname !== '/login') {
            console.log('Redirecting to login after sign out');
            navigate('/login');
          }
        }
      }
    );
    
    // Cleanup subscription on unmount
    return () => {
      console.log('AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures this only runs once
  
  // Helper functions
  const signOut = async () => {
    try {
      console.log('Attempting to sign out');
      await supabase.auth.signOut();
      console.log('Sign out successful');
      // Auth change listener will handle state updates and navigation
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthError(error instanceof Error ? error : new Error('Error signing out'));
      throw error;
    }
  };

  const updateStreak = async () => {
    if (!user) return;
    
    try {
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
      setAuthError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error during sign in:', error);
      setAuthError(error instanceof Error ? error : new Error('Error during sign in'));
      throw error;
    }
  };

  // Create auth context value
  const value: AuthContextType = {
    user,
    session,
    authError,
    signOut,
    updateStreak,
    signIn,
    signUp,
  };

  // Display loading indicator while initializing
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  // Provide auth context to children
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
