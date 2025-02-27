
import { User, Session } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  authError: Error | null; // Add this property to the interface
  signOut: () => Promise<void>;
  updateStreak: () => Promise<void>;
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, displayName: string, isTestAccount?: boolean) => Promise<void>;
}
