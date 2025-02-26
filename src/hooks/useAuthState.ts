
import { useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Wrap state setters in useCallback to prevent unnecessary re-renders
  const setUserState = useCallback((newUser: User | null) => {
    setUser(newUser);
  }, []);

  const setSessionState = useCallback((newSession: Session | null) => {
    setSession(newSession);
  }, []);

  const setLoadingState = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  return {
    user,
    setUser: setUserState,
    session,
    setSession: setSessionState,
    loading,
    setLoading: setLoadingState,
  };
}
