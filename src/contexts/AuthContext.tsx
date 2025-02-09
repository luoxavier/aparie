
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { signInWithIdentifier, signUpWithEmail } from "@/services/auth";

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
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          navigate('/login');
          return;
        }

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          await updateUserStreak();
        }
      } catch (error) {
        console.error('Error in auth initialization:', error);
        setSession(null);
        setUser(null);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, currentSession) => {
      console.log('Auth state changed:', event);
      
      switch (event) {
        case 'TOKEN_REFRESHED':
        case 'SIGNED_IN':
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          if (event === 'SIGNED_IN') {
            await updateUserStreak();
          }
          break;
        case 'SIGNED_OUT':
          setSession(null);
          setUser(null);
          navigate('/login');
          break;
        case 'USER_UPDATED':
        case 'PASSWORD_RECOVERY':
        case 'MFA_CHALLENGE_VERIFIED':
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const updateUserStreak = async () => {
    if (!user) return;

    try {
      // First try to update the streak
      const { error: updateError } = await supabase
        .from('user_streaks')
        .update({ last_activity_date: new Date().toISOString() })
        .eq('user_id', user.id);

      if (updateError) {
        // If update fails, the row might not exist, so try to insert
        const { error: insertError } = await supabase
          .from('user_streaks')
          .insert([{ 
            user_id: user.id,
            last_activity_date: new Date().toISOString(),
            current_streak: 1,
            highest_streak: 1
          }]);

        if (insertError) {
          console.error('Error creating streak:', insertError);
          return;
        }
      }

      // Get the current streak data
      const { data: streakData, error: fetchError } = await supabase
        .from('user_streaks')
        .select('current_streak, highest_streak')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching streak:', fetchError);
        return;
      }

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
    updateStreak: updateUserStreak,
    signIn,
    signUp,
  };

  if (loading) {
    return null;
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
