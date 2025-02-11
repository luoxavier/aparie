
import { useState } from "react";
import { User, Session } from "@supabase/supabase-js";

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  return {
    user,
    setUser,
    session,
    setSession,
    loading,
    setLoading,
  };
}
