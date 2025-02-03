import { useState, useEffect } from "react";
import { Flashcard } from "@/components/Flashcard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { playSound } from "@/utils/sound";

interface StudySessionProps {
  currentCard: FlashcardType;
  deck: FlashcardType[];
  onResult: (correct: boolean) => void;
  onNext: () => void;
  streak: number;
}

interface FlashcardType {
  id: string;
  front: string;
  back: string;
  creator_id?: string;
  playlist_name?: string;
}

export function StudySession({ 
  currentCard, 
  deck, 
  onResult, 
  onNext,
  streak 
}: StudySessionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [studyStartTime] = useState(Date.now());
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);

  // Update study time quest progress
  useEffect(() => {
    if (!user) return;

    const updateStudyTime = async () => {
      const currentTime = Date.now();
      // Check if user has been inactive for more than 15 seconds
      if (currentTime - lastActivityTime > 15000) {
        return;
      }

      const elapsedMinutes = Math.floor((currentTime - studyStartTime) / 60000);
      
      const { data: timeQuests } = await supabase
        .from('user_quests')
        .select('*, quests(*)')
        .eq('user_id', user.id)
        .gte('expires_at', new Date().toISOString());

      if (timeQuests && timeQuests.length > 0) {
        const infiniteQuests = timeQuests.filter(q => 
          q.quests?.type === 'infinite'
        );

        for (const quest of infiniteQuests) {
          if (!quest.completed && quest.quests) {
            const newProgress = Math.min(elapsedMinutes, quest.quests.requirement_count);
            
            if (newProgress > quest.progress) {
              const { data: updatedQuest } = await supabase
                .from('user_quests')
                .update({ 
                  progress: newProgress,
                  completed: newProgress >= quest.quests.requirement_count,
                  completed_at: newProgress >= quest.quests.requirement_count ? new Date().toISOString() : null
                })
                .eq('id', quest.id)
                .select()
                .single();

              if (updatedQuest?.completed) {
                playSound('complete');
                toast({
                  title: "Quest Completed! 🎉",
                  description: `You've earned ${quest.quests.xp_reward} XP!`,
                });
              }
            }
          }
        }
      }
    };

    const timer = setInterval(updateStudyTime, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [user, studyStartTime, lastActivityTime]);

  // Update accuracy quest progress
  useEffect(() => {
    const updateAccuracyProgress = async () => {
      if (!user || totalAnswers === 0) return;

      const accuracy = Math.floor((correctAnswers / totalAnswers) * 100);
      
      const { data: accuracyQuests } = await supabase
        .from('user_quests')
        .select('*, quests(*)')
        .eq('user_id', user.id)
        .gte('expires_at', new Date().toISOString());

      if (accuracyQuests) {
        const playlistQuests = accuracyQuests.filter(q => 
          q.quests?.type.includes('playlist_')
        );

        for (const quest of playlistQuests) {
          if (!quest.completed && quest.quests && accuracy >= quest.quests.requirement_count) {
            const { data: updatedQuest } = await supabase
              .from('user_quests')
              .update({ 
                progress: accuracy,
                completed: true,
                completed_at: new Date().toISOString()
              })
              .eq('id', quest.id)
              .select()
              .single();

            if (updatedQuest?.completed) {
              playSound('complete');
              toast({
                title: "Quest Completed! 🎉",
                description: `You've achieved ${accuracy}% accuracy and earned ${quest.quests.xp_reward} XP!`,
              });
            }
          } else if (quest.quests && accuracy > quest.progress) {
            // Update progress even if not completed
            await supabase
              .from('user_quests')
              .update({ progress: accuracy })
              .eq('id', quest.id);
          }
        }
      }
    };

    updateAccuracyProgress();
  }, [correctAnswers, totalAnswers, user]);

  const handleAnswer = async (isCorrect: boolean) => {
    setLastActivityTime(Date.now());
    setTotalAnswers(prev => prev + 1);
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    onResult(isCorrect);
  };

  const getOtherAnswers = (currentCard: FlashcardType) => {
    return deck
      .filter(card => card.id !== currentCard.id)
      .map(card => card.back);
  };

  return (
    <Flashcard
      front={currentCard.front}
      back={currentCard.back}
      otherAnswers={getOtherAnswers(currentCard)}
      onResult={handleAnswer}
      onNext={onNext}
      creatorId={currentCard.creator_id}
      playlistName={currentCard.playlist_name}
      streak={streak}
    />
  );
}