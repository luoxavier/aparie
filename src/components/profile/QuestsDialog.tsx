import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Award, ListCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

type Quest = {
  id: string;
  title: string;
  description: string;
  type: 'mastery' | 'infinite' | 'playlist_private' | 'playlist_public';
  requirement_count: number;
};

type UserQuest = {
  quest_id: string;
  progress: number;
  completed: boolean;
};

export function QuestsDialog() {
  const { user } = useAuth();

  const { data: quests, isLoading: questsLoading } = useQuery({
    queryKey: ['quests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quests')
        .select('*');
      
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

  const { data: userQuests, isLoading: userQuestsLoading } = useQuery({
    queryKey: ['user-quests', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', user?.id);
      
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

  const getQuestProgress = (questId: string) => {
    const userQuest = userQuests?.find(uq => uq.quest_id === questId);
    return userQuest?.progress || 0;
  };

  const isQuestCompleted = (questId: string) => {
    const userQuest = userQuests?.find(uq => uq.quest_id === questId);
    return userQuest?.completed || false;
  };

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
        
        {(questsLoading || userQuestsLoading) ? (
          <div className="py-6">Loading quests...</div>
        ) : (
          <div className="grid gap-4 py-4">
            {quests?.map((quest) => {
              const progress = getQuestProgress(quest.id);
              const completed = isQuestCompleted(quest.id);
              const progressPercentage = (progress / quest.requirement_count) * 100;
              
              return (
                <div key={quest.id} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{quest.title}</h4>
                      <p className="text-sm text-muted-foreground">{quest.description}</p>
                    </div>
                    {completed && (
                      <Award className="h-5 w-5 text-primary animate-sparkle" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <Progress value={progressPercentage} className="h-2" />
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