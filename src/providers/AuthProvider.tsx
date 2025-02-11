
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { signInWithIdentifier, signUpWithEmail } from "@/services/auth";
import { AuthContextType } from "@/types/auth";
import { useUserStreak } from "@/hooks/useUserStreak";
import { useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { updateUserStreak } = useUserStreak();
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (currentSession) {
            setSession(currentSession);
            setUser(currentSession.user);
            await updateUserStreak(currentSession.user);
            
            // Prefetch profile data
            queryClient.prefetchQuery({
              queryKey: ['profile', currentSession.user.id],
              queryFn: async () => {
                const { data, error } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', currentSession.user.id)
                  .maybeSingle();
                
                if (error) throw error;
                return data;
              },
              staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
            });
          } else {
            setSession(null);
            setUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in auth initialization:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, currentSession) => {
      console.log('Auth state changed:', event);
      
      if (!mounted) return;

      switch (event) {
        case 'TOKEN_REFRESHED':
        case 'SIGNED_IN':
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          if (event === 'SIGNED_IN') {
            await updateUserStreak(currentSession?.user ?? null);
            queryClient.invalidateQueries({ queryKey: ['profile'] });
          }
          break;
        case 'SIGNED_OUT':
          setSession(null);
          setUser(null);
          queryClient.clear(); // Clear all queries on sign out
          navigate('/login');
          break;
        case 'USER_UPDATED':
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          queryClient.invalidateQueries({ queryKey: ['profile'] });
          break;
        case 'INITIAL_SESSION':
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          break;
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, updateUserStreak, queryClient]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      navigate('/login');
      
      toast({
        title: "Signed out successfully",
        description: "Come back tomorrow to keep your streak!",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      setUser(null);
      setSession(null);
      navigate('/login');
      
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "Your session has been cleared locally",
      });
    }
  };

  const signIn = async (identifier: string, password: string) => {
    try {
      await signInWithIdentifier(identifier, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    try {
      // First check if username exists
      const { data: existingUsername } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existingUsername) {
        toast({
          variant: "destructive",
          title: "Username already taken",
          description: "This username is already taken. Please choose a different one.",
        });
        throw new Error("Username taken");
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: displayName,
          },
        },
      });

      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('User already registered')) {
          errorMessage = "This email is already registered. Please try logging in instead.";
        }
        
        toast({
          variant: "destructive",
          title: "Error signing up",
          description: errorMessage,
        });
        throw error;
      }

      toast({
        title: "Account created",
        description: "Welcome to the app! Please check your email to verify your account.",
      });
    } catch (error) {
      console.error('Error signing up:', error);
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
