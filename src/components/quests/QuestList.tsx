import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuestProgress } from "./QuestProgress";
import { useEffect } from "react";
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

  // Fetch quests data
  const { data: quests, refetch: refetchQuests } = useQuery({
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
  });

  // Fetch user quests with more frequent updates
  const { data: userQuests, refetch: refetchUserQuests } = useQuery({
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
    enabled: !!user && !!quests,
    refetchInterval: 2000, // Update every 2 seconds for more responsive progress
  });

  // Subscribe to real-time updates
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
        () => {
          refetchUserQuests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetchUserQuests]);

  // Assign daily quests if none exist
  const assignDailyQuests = async () => {
    if (!user?.id) return;
    
    await supabase.rpc('assign_daily_quests', { 
      user_id_param: user.id 
    });
    
    refetchUserQuests();
  };

  // Check and assign quests if needed
  useEffect(() => {
    if (user && (!userQuests || userQuests.length === 0)) {
      assignDailyQuests();
    }
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