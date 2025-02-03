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

  // Function to assign daily quests
  const assignDailyQuests = async () => {
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
    return data;
  };

  // Mutation for assigning daily quests
  const { mutate: assignQuests } = useMutation({
    mutationFn: assignDailyQuests,
    onSuccess: () => {
      // Refetch quests after assignment
      userQuestsQuery.refetch();
    },
  });

  const { data: quests, isLoading: questsLoading } = useQuery({
    queryKey: ['quests'],
    queryFn: async () => {
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

      return data as Quest[];
    },
  });

  const userQuestsQuery = useQuery({
    queryKey: ['user-quests', user?.id],
    queryFn: async () => {
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

      return data as UserQuest[];
    },
    enabled: !!user,
  });

  // Effect to check and assign daily quests if needed
  useEffect(() => {
    if (user && userQuestsQuery.data && userQuestsQuery.data.length === 0) {
      assignQuests();
    }
  }, [user, userQuestsQuery.data, assignQuests]);

  // Effect to animate progress bars
  useEffect(() => {
    if (userQuestsQuery.data && quests) {
      const newProgressValues: Record<string, number> = {};
      userQuestsQuery.data.forEach(userQuest => {
        const quest = quests.find(q => q.id === userQuest.quest_id);
        if (quest) {
          // Start from 0 and animate to actual progress
          newProgressValues[userQuest.quest_id] = 0;
          setTimeout(() => {
            setProgressValues(prev => ({
              ...prev,
              [userQuest.quest_id]: (userQuest.progress / quest.requirement_count) * 100
            }));
          }, 100);
        }
      });
      setProgressValues(newProgressValues);
    }
  }, [userQuestsQuery.data, quests]);

  const getQuestProgress = (questId: string) => {
    const userQuest = userQuestsQuery.data?.find(uq => uq.quest_id === questId);
    return userQuest?.progress || 0;
  };

  const isQuestCompleted = (questId: string) => {
    const userQuest = userQuestsQuery.data?.find(uq => uq.quest_id === questId);
    return userQuest?.completed || false;
  };

  const getActiveQuests = () => {
    if (!userQuestsQuery.data || !quests) return [];
    return quests.filter(quest => 
      userQuestsQuery.data.some(uq => uq.quest_id === quest.id)
    );
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
                <div key={quest.id} className={`space-y-2 p-4 rounded-lg transition-colors ${completed ? 'bg-primary/5' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {quest.title}
                        {completed && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground">{quest.description}</p>
                      <p className={`text-xs ${completed ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
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
                      className={`h-2 transition-all duration-1000 ease-out ${completed ? 'bg-primary/20' : ''}`}
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