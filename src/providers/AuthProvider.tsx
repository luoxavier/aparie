
import { createContext, useContext, useEffect, useRef, useCallback } from "react";
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
  const initializingRef = useRef(false);

  const handleAuthStateChange = useCallback(async (event: AuthChangeEvent, currentSession: any) => {
    console.log('Auth state changed:', event);
    
    if (!mountedRef.current) return;

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        if (window.location.pathname !== '/') {
          navigate('/');
        }
      }
    } else if (event === 'SIGNED_OUT') {
      setSession(null);
      setUser(null);
      queryClient.clear();
      if (window.location.pathname !== '/login') {
        navigate('/login');
      }
    }
  }, [navigate, queryClient, setUser, setSession]);

  useEffect(() => {
    mountedRef.current = true;
    
    const initAuth = async () => {
      if (initializingRef.current) return;
      initializingRef.current = true;
      
      try {
        await initializeSession(mountedRef.current);
      } finally {
        initializingRef.current = false;
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, initializeSession]);

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
    updateStreak: async () => {},
    signIn,
    signUp,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
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
