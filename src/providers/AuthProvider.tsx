
import { createContext, useContext, useEffect, useRef } from "react";
import { AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { signInWithIdentifier } from "@/services/auth";
import { AuthContextType } from "@/types/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthState } from "@/hooks/useAuthState";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useSessionInit } from "@/hooks/useSessionInit";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, session, setSession, loading, setLoading } = useAuthState();
  const { signOut, signUp } = useAuthActions();
  const initializeSession = useSessionInit(setUser, setSession, setLoading);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const mountedRef = useRef(false);

  useEffect(() => {
    console.log('AuthProvider: Starting session initialization');
    mountedRef.current = true;
    
    initializeSession(mountedRef.current);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, currentSession) => {
      console.log('Auth state changed:', event, 'Session:', currentSession ? 'exists' : 'null');
      
      if (!mountedRef.current) return;

      if (event === 'SIGNED_IN') {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        navigate('/');
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        // Clear everything on sign out
        setSession(null);
        setUser(null);
        queryClient.clear();
        await supabase.auth.setSession(null); // Ensure local session is cleared
        navigate('/login');
      } else if (event === 'TOKEN_REFRESHED') {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      }
    });

    return () => {
      console.log('AuthProvider: Cleaning up');
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [navigate, queryClient, setUser, setSession, setLoading, initializeSession]);

  const signIn = async (identifier: string, password: string) => {
    setLoading(true);
    try {
      await signInWithIdentifier(identifier, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const value = {
    user,
    session,
    signOut,
    updateStreak: async () => {}, // Simplified - streak updates will be handled separately
    signIn,
    signUp,
  };

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
