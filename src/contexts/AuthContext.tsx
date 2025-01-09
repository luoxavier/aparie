import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

const supabaseUrl = "https://bigybgdgpvbokmghhawr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZ3liZ2RncHZib2ttZ2hoYXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0MDIwNDIsImV4cCI6MjA1MTk3ODA0Mn0.Mtr6svZvhATkDN7B1-Lst2AJ8L_XW9LsQjp5SEwtEWs";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase URL or API key. Make sure you have connected your project to Supabase.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface AuthContextType {
  user: any | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, username: string) => {
    // First check if username is already taken in login table
    const { data: existingUser, error: checkError } = await supabase
      .from('login')
      .select('username')
      .eq('username', username)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(checkError.message);
    }

    if (existingUser) {
      throw new Error('Username is already taken');
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;

    // Store username in login table
    const { error: insertError } = await supabase
      .from('login')
      .insert([{ username, password }]);

    if (insertError) throw insertError;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};