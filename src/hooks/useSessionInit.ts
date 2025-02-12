
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useSessionInit(
  setUser: (user: User | null) => void,
  setSession: (session: any) => void,
  setLoading: (loading: boolean) => void
) {
  const initializeSession = async (mounted: boolean) => {
    console.log('useSessionInit: Starting session initialization');
    if (!mounted) {
      console.log('Component not mounted, skipping initialization');
      return;
    }

    try {
      console.log('Fetching current session');
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        console.log('Session found, setting up user data');
        setSession(currentSession);
        setUser(currentSession.user);
      } else {
        console.log('No session found, clearing user data');
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error in auth initialization:', error);
      setSession(null);
      setUser(null);
    } finally {
      console.log('Setting loading to false after initialization');
      if (mounted) {
        setLoading(false);
      }
    }
  };

  return initializeSession;
}
