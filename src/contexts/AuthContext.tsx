import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { signInWithIdentifier } from "@/services/auth";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signOut: () => Promise<void>;
  updateStreak: () => Promise<void>;
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentSession = await supabase.auth.getSession();
        if (currentSession.error) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          return;
        }
        
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          await updateUserStreak();
        }

      } catch (error) {
        console.error('Error in auth initialization:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (event === 'SIGNED_IN') {
        await updateUserStreak();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const updateUserStreak = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_streaks')
        .update({ last_activity_date: new Date().toISOString() })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating streak:', error);
        return;
      }

      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('current_streak, highest_streak')
        .eq('user_id', user.id)
        .single();

      if (streakData) {
        toast({
          title: `Daily Streak: ${streakData.current_streak} days`,
          description: streakData.current_streak > 1 
            ? "Keep up the great work!" 
            : "Welcome back! Start your streak!",
        });
      }
    } catch (error) {
      console.error('Error in updateUserStreak:', error);
    }
  };

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
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "Please try again",
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

      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    session,
    signOut,
    updateStreak: updateUserStreak,
    signIn,
    signUp,
  };

  if (loading) {
    return null; // or a loading spinner
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
