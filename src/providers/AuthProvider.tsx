
import { createContext, useContext, useEffect } from "react";
import { AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { signInWithIdentifier } from "@/services/auth";
import { AuthContextType } from "@/types/auth";
import { useUserStreak } from "@/hooks/useUserStreak";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthState } from "@/hooks/useAuthState";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useSessionInit } from "@/hooks/useSessionInit";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, session, setSession, loading, setLoading } = useAuthState();
  const { updateUserStreak } = useUserStreak();
  const { signOut, signUp } = useAuthActions();
  const initializeSession = useSessionInit(setUser, setSession, setLoading, updateUserStreak);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // Initialize session
    initializeSession(mounted);

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, currentSession) => {
      console.log('Auth state changed:', event);
      
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (event === 'SIGNED_IN') {
          await updateUserStreak(currentSession?.user ?? null);
          queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        queryClient.clear();
        navigate('/login');
      }

      // Make sure to set loading to false after handling auth state change
      setLoading(false);
    });

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, updateUserStreak, queryClient, setUser, setSession, setLoading]);

  const signIn = async (identifier: string, password: string) => {
    try {
      await signInWithIdentifier(identifier, password);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    session,
    signOut,
    updateStreak: () => updateUserStreak(user),
    signIn,
    signUp,
  };

  // Only show loading state for initial authentication check
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
