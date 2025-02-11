
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuestProgress } from "./QuestProgress";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'mastery' | 'infinite' | 'playlist_private' | 'playlist_public';
  requirement_count: number;
  xp_reward: number;
}

interface UserQuest {
  quest_id: string;
  progress: number;
  completed: boolean;
  expires_at: string | null;
}

export function QuestList() {
  const { user } = useAuth();

  // Fetch quests data with optimized caching
  const { data: quests, isLoading: questsLoading } = useQuery({
    queryKey: ['quests'],
    queryFn: async () => {
      console.log('Fetching quests');
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('is_daily', true);
      
      if (error) throw error;
      return data as Quest[];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });

  // Fetch user quests with optimized configuration
  const { data: userQuests, isLoading: userQuestsLoading } = useQuery({
    queryKey: ['user-quests', user?.id],
    queryFn: async () => {
      console.log('Fetching user quests for:', user?.id);
      const { data, error } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', user?.id)
        .gte('expires_at', new Date().toISOString());
      
      if (error) throw error;
      return data as UserQuest[];
    },
    enabled: !!user,
    staleTime: 1000 * 30, // Consider data fresh for 30 seconds
    refetchInterval: 5000, // Update every 5 seconds for progress
  });

  // Subscribe to real-time updates with debounced refetch
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-quests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_quests',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Only refetch if the change is relevant
          if (payload.new && !payload.new.completed) {
            setTimeout(() => {
              // Wait a brief moment to allow any batch updates to complete
              queryClient.invalidateQueries({ queryKey: ['user-quests', user.id] });
            }, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Assign daily quests if none exist
  const assignDailyQuests = async () => {
    if (!user?.id) return;
    
    await supabase.rpc('assign_daily_quests', { 
      user_id_param: user.id 
    });
  };

  // Check and assign quests if needed
  useEffect(() => {
    if (user && (!userQuests || userQuests.length === 0)) {
      assignDailyQuests();
    }
  }, [user, userQuests]);

  if (questsLoading || userQuestsLoading) {
    return (
      <div className="grid gap-4 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[100px] w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (!quests || !userQuests) {
    return <div className="py-6">No quests available</div>;
  }

  return (
    <div className="grid gap-4 py-4">
      {quests.map((quest) => {
        const userQuest = userQuests.find(uq => uq.quest_id === quest.id);
        if (!userQuest) return null;

        return (
          <QuestProgress
            key={quest.id}
            title={quest.title}
            description={quest.description}
            progress={userQuest.progress}
            total={quest.requirement_count}
            xpReward={quest.xp_reward}
            completed={userQuest.completed}
          />
        );
      })}
    </div>
  );
}
