import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bigybgdgpvbokmghhawr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZ3liZ2RncHZib2ttZ2hoYXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5NTc2NzgsImV4cCI6MjAyMzUzMzY3OH0.Wd_7e_DKJbEJDxGzCGxgUPH_R8c7Za8MkS8-KfAaG8Y";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'apikey': SUPABASE_ANON_KEY
      }
    }
  }
);