
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

  return initializeSession;
}
