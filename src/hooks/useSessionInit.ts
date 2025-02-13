
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
      // First try to recover the session
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        throw error;
      }
      
      if (currentSession) {
        console.log('Session found, setting up user data');
        setSession(currentSession);
        setUser(currentSession.user);
      } else {
        console.log('No session found, attempting to refresh token');
        const { data: { session: refreshedSession }, error: refreshError } = 
          await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.log('Token refresh failed:', refreshError);
          setSession(null);
          setUser(null);
        } else if (refreshedSession) {
          console.log('Session refreshed successfully');
          setSession(refreshedSession);
          setUser(refreshedSession.user);
        } else {
          console.log('No session could be recovered');
          setSession(null);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error in auth initialization:', error);
      // Clear the session state on error
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
