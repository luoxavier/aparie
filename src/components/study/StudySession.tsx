import { useState, useEffect } from "react";
import { Flashcard } from "@/components/Flashcard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);

  // Update study time quest progress
  useEffect(() => {
    if (!user) return;

    const updateStudyTime = async () => {
      const elapsedMinutes = Math.floor((Date.now() - studyStartTime) / 60000);
      
      const { data: timeQuests } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', user.id)
        .gte('expires_at', new Date().toISOString());

      if (timeQuests && timeQuests.length > 0) {
        const infiniteQuest = timeQuests.find(q => 
          q.quest_id && q.quest_id.toString().includes('infinite')
        );

        if (infiniteQuest) {
          await supabase
            .from('user_quests')
            .update({ progress: elapsedMinutes })
            .eq('id', infiniteQuest.id);
        }
      }
    };

    const timer = setInterval(updateStudyTime, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [user, studyStartTime]);

  // Update accuracy quest progress
  useEffect(() => {
    const updateAccuracyProgress = async () => {
      if (!user || totalAnswers === 0) return;

      const accuracy = Math.floor((correctAnswers / totalAnswers) * 100);
      
      const { data: accuracyQuests } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', user.id)
        .gte('expires_at', new Date().toISOString());

      if (accuracyQuests) {
        const playlistQuest = accuracyQuests.find(q => 
          q.quest_id && (
            q.quest_id.toString().includes('playlist_private') || 
            q.quest_id.toString().includes('playlist_public')
          )
        );

        if (playlistQuest && accuracy >= playlistQuest.requirement_count) {
          await supabase
            .from('user_quests')
            .update({ 
              progress: accuracy,
              completed: true 
            })
            .eq('id', playlistQuest.id);

          toast({
            title: "Quest Completed!",
            description: `You've achieved ${accuracy}% accuracy!`,
          });
        }
      }
    };

    updateAccuracyProgress();
  }, [correctAnswers, totalAnswers, user]);

  const handleAnswer = async (isCorrect: boolean) => {
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