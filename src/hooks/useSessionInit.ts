
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function useSessionInit(
  setUser: (user: User | null) => void,
  setSession: (session: any) => void,
  setLoading: (loading: boolean) => void,
  updateUserStreak: (user: User | null) => Promise<void>
) {
  const queryClient = useQueryClient();

  const initializeSession = async (mounted: boolean) => {
    console.log('useSessionInit: Starting session initialization');
    if (!mounted) {
      console.log('Component not mounted, skipping initialization');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching current session');
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        console.log('Session found, setting up user data');
        setSession(currentSession);
        setUser(currentSession.user);
        await updateUserStreak(currentSession.user);
        
        // Prefetch profile data
        await queryClient.prefetchQuery({
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
