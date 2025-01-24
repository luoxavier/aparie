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
    
    // Check for refresh token errors
    const isRefreshTokenError = 
      error.message?.includes('refresh_token_not_found') || 
      error.message?.includes('Invalid Refresh Token') ||
      error.error?.message?.includes('refresh_token_not_found') ||
      error.status === 400;
    
    if (isRefreshTokenError) {
      // Clear the session completely
      await supabase.auth.signOut();
      await supabase.auth.setSession(null);
      setSession(null);
      setUser(null);
      
      // Only navigate if we're not already on the login page
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
    // Initialize session
    const initSession = async () => {
      try {
        // Clear any existing session first
        await supabase.auth.setSession(null);
        
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

    // Set up auth state listener
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

    // Cleanup subscription
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