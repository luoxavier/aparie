import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Award, ListCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

type Quest = {
  id: string;
  title: string;
  description: string;
  type: 'mastery' | 'infinite' | 'playlist_private' | 'playlist_public';
  requirement_count: number;
  xp_reward: number;
};

type UserQuest = {
  quest_id: string;
  progress: number;
  completed: boolean;
  expires_at: string | null;
};

export function QuestsDialog() {
  const { user } = useAuth();
  const [progressValues, setProgressValues] = useState<Record<string, number>>({});
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());

  const assignDailyQuests = async () => {
    console.log('Attempting to assign daily quests for user:', user?.id);
    const { data, error } = await supabase
      .rpc('assign_daily_quests', { user_id_param: user?.id });
    
    if (error) {
      console.error('Error assigning daily quests:', error);
      toast({
        title: "Error",
        description: "Failed to assign daily quests",
        variant: "destructive",
      });
      throw error;
    }
    console.log('Daily quests assigned successfully:', data);
    return data;
  };

  const { mutate: assignQuests } = useMutation({
    mutationFn: assignDailyQuests,
    onSuccess: () => {
      userQuestsQuery.refetch();
    },
  });

  const { data: quests, isLoading: questsLoading } = useQuery({
    queryKey: ['quests'],
    queryFn: async () => {
      console.log('Fetching quests');
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('is_daily', true);
      
      if (error) {
        console.error('Error fetching quests:', error);
        toast({
          title: "Error",
          description: "Failed to load quests",
          variant: "destructive",
        });
        throw error;
      }
      console.log('Quests fetched:', data);
      return data as Quest[];
    },
  });

  const userQuestsQuery = useQuery({
    queryKey: ['user-quests', user?.id],
    queryFn: async () => {
      console.log('Fetching user quests for:', user?.id);
      const { data, error } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', user?.id)
        .gte('expires_at', new Date().toISOString());
      
      if (error) {
        console.error('Error fetching user quests:', error);
        toast({
          title: "Error",
          description: "Failed to load quest progress",
          variant: "destructive",
        });
        throw error;
      }
      
      console.log('User quests fetched:', data);
      
      // Update completed quests
      const newCompletedQuests = new Set<string>();
      data?.forEach(quest => {
        if (quest.completed || quest.progress >= (quests?.find(q => q.id === quest.quest_id)?.requirement_count || 0)) {
          console.log(`Quest ${quest.quest_id} marked as completed with progress:`, quest.progress);
          newCompletedQuests.add(quest.quest_id);
        } else {
          console.log(`Quest ${quest.quest_id} in progress:`, quest.progress);
        }
      });
      
      setCompletedQuests(newCompletedQuests);
      
      return data as UserQuest[];
    },
    enabled: !!user,
    refetchInterval: 5000, // Refetch every 5 seconds to check for updates
  });

  useEffect(() => {
    if (user && (!userQuestsQuery.data || userQuestsQuery.data.length === 0)) {
      console.log('No active quests found, assigning new ones');
      assignQuests();
    }
  }, [user, userQuestsQuery.data, assignQuests]);

  useEffect(() => {
    if (userQuestsQuery.data && quests) {
      console.log('Setting up progress animations');
      const newProgressValues: Record<string, number> = {};
      
      userQuestsQuery.data.forEach(userQuest => {
        const quest = quests.find(q => q.id === userQuest.quest_id);
        if (quest) {
          const progressPercentage = Math.min((userQuest.progress / quest.requirement_count) * 100, 100);
          console.log(`Quest ${quest.id} progress update:`, {
            current: userQuest.progress,
            required: quest.requirement_count,
            percentage: progressPercentage,
            completed: userQuest.completed || userQuest.progress >= quest.requirement_count,
            type: quest.type
          });
          
          newProgressValues[userQuest.quest_id] = progressPercentage;
        }
      });
      
      setProgressValues(newProgressValues);
    }
  }, [userQuestsQuery.data, quests]);

  const getQuestProgress = (questId: string) => {
    const userQuest = userQuestsQuery.data?.find(uq => uq.quest_id === questId);
    const quest = quests?.find(q => q.id === questId);
    const progress = Math.min(userQuest?.progress || 0, quest?.requirement_count || 0);
    console.log(`Getting progress for quest ${questId}:`, progress);
    return progress;
  };

  const isQuestCompleted = (questId: string) => {
    const userQuest = userQuestsQuery.data?.find(uq => uq.quest_id === questId);
    const quest = quests?.find(q => q.id === questId);
    const completed = userQuest?.completed || (userQuest?.progress || 0) >= (quest?.requirement_count || 0);
    console.log(`Checking completion for quest ${questId}:`, completed);
    return completed;
  };

  const getActiveQuests = () => {
    if (!userQuestsQuery.data || !quests) return [];
    const activeQuests = quests.filter(quest => 
      userQuestsQuery.data.some(uq => uq.quest_id === quest.id)
    );
    console.log('Active quests:', activeQuests);
    return activeQuests;
  };

  const activeQuests = getActiveQuests();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
        >
          <Award className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListCheck className="h-5 w-5" />
            Daily Quests
          </DialogTitle>
        </DialogHeader>
        
        {(questsLoading || userQuestsQuery.isLoading) ? (
          <div className="py-6">Loading quests...</div>
        ) : (
          <div className="grid gap-4 py-4">
            {activeQuests.map((quest) => {
              const progress = getQuestProgress(quest.id);
              const completed = isQuestCompleted(quest.id);
              const progressValue = progressValues[quest.id] || 0;
              
              return (
                <div 
                  key={quest.id} 
                  className={`space-y-2 p-4 rounded-lg transition-all duration-300 ${
                    completed ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {quest.title}
                        {completed && (
                          <CheckCircle2 className="h-4 w-4 text-primary animate-in fade-in" />
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground">{quest.description}</p>
                      <p className={`text-xs ${
                        completed ? 'text-primary font-medium' : 'text-muted-foreground'
                      }`}>
                        {completed ? `+${quest.xp_reward} XP Earned!` : `+${quest.xp_reward} XP`}
                      </p>
                    </div>
                    {completed && (
                      <Award className="h-5 w-5 text-primary animate-sparkle" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <Progress 
                      value={progressValue} 
                      className={`h-2 transition-all duration-1000 ease-out ${
                        completed ? 'bg-primary/20' : ''
                      }`}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {progress} / {quest.requirement_count}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}