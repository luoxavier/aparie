import { createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://bigybgdgpvbokmghhawr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZ3liZ2RncHZib2ttZ2hoYXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0MDIwNDIsImV4cCI6MjA1MTk3ODA0Mn0.Mtr6svZvhATkDN7B1-Lst2AJ8L_XW9LsQjp5SEwtEWs";

const supabase = createClient(supabaseUrl, supabaseKey);

interface AuthContextType {
  user: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: null }}>
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