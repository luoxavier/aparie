
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuestProgress } from "./QuestProgress";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

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
  const [manuallyRefetch, setManuallyRefetch] = useState(false);
  const lastFetchTimeRef = useRef<number>(Date.now());

  // Fetch quests data - cache for 5 minutes
  const { data: quests } = useQuery({
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });

  // Fetch user quests with less frequent updates
  const { data: userQuests, refetch: refetchUserQuests } = useQuery({
    queryKey: ['user-quests', user?.id, manuallyRefetch],
    queryFn: async () => {
      console.log('Fetching user quests for:', user?.id);
      lastFetchTimeRef.current = Date.now();
      
      const { data, error } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', user?.id)
        .gte('expires_at', new Date().toISOString());
      
      if (error) throw error;
      return data as UserQuest[];
    },
    enabled: !!user && !!quests,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 2 * 60 * 1000, // Only auto-refresh every 2 minutes
  });

  // Subscribe to real-time updates but throttle to avoid excessive refreshes
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
          // Only refetch if it's been at least 15 seconds since the last fetch
          const now = Date.now();
          if (now - lastFetchTimeRef.current > 15000) {
            setManuallyRefetch(prev => !prev); // Toggle to trigger refetch
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Assign daily quests if none exist, but don't spam the assignment
  const assignQuestsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const assignDailyQuests = async () => {
    if (!user?.id) return;
    
    if (assignQuestsTimeoutRef.current) {
      clearTimeout(assignQuestsTimeoutRef.current);
    }
    
    assignQuestsTimeoutRef.current = setTimeout(async () => {
      await supabase.rpc('assign_daily_quests', { 
        user_id_param: user.id 
      });
      
      refetchUserQuests();
      assignQuestsTimeoutRef.current = null;
    }, 1000);
  };

  // Check and assign quests only once
  useEffect(() => {
    if (user && (!userQuests || userQuests.length === 0)) {
      assignDailyQuests();
    }
    
    return () => {
      if (assignQuestsTimeoutRef.current) {
        clearTimeout(assignQuestsTimeoutRef.current);
      }
    };
  }, [user, userQuests]);

  if (!quests || !userQuests) {
    return <div className="py-6">Loading quests...</div>;
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
