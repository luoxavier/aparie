import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { signInWithIdentifier, signUpWithEmail, signOut as authSignOut } from "@/services/auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";

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
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthError = async (error: any) => {
    console.error('Auth error:', error);
    
    const isRefreshTokenError = 
      error.message?.includes('refresh_token_not_found') || 
      error.message?.includes('Invalid Refresh Token') ||
      error.status === 400;
    
    if (isRefreshTokenError) {
      // Clear the session and user state
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      
      if (location.pathname !== '/login') {
        navigate('/login');
        toast({
          title: "Session expired",
          description: "Please sign in again to continue",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Authentication error",
        description: "There was a problem with your session. Please try signing in again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        // Clear any existing invalid session first
        const currentSession = await supabase.auth.getSession();
        if (currentSession.error) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          return;
        }
        
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          handleAuthError(error);
          return;
        }
        
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
        }
        setLoading(false);
      } catch (error) {
        handleAuthError(error);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      try {
        if (_event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        } else if (_event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          if (location.pathname !== '/login') {
            navigate('/login');
          }
        }
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      } catch (error) {
        handleAuthError(error);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, location.pathname]);

  const value = {
    session,
    user,
    signIn: signInWithIdentifier,
    signUp: signUpWithEmail,
    signOut: authSignOut,
  };

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