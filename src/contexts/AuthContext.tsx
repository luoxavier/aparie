import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { signInWithIdentifier, signUpWithEmail, signOut as authSignOut } from "@/services/auth";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize session
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (error) {
        console.error('Error fetching initial session:', error);
        toast({
          title: "Error",
          description: "Failed to initialize session",
          variant: "destructive",
        });
        return;
      }
      
      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
      }
      setLoading(false);
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      try {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('Error handling auth state change:', error);
        toast({
          title: "Error",
          description: "Failed to update authentication state",
          variant: "destructive",
        });
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const value = {
    session,
    user,
    signIn: signInWithIdentifier,
    signUp: signUpWithEmail,
    signOut: authSignOut,
  };

  // Show loading state
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}