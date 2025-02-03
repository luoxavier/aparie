import { useState, useEffect } from "react";
import { Flashcard } from "@/components/Flashcard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const [studyStartTime] = useState(Date.now());

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
      onResult={onResult}
      onNext={onNext}
      creatorId={currentCard.creator_id}
      playlistName={currentCard.playlist_name}
      streak={streak}
    />
  );
}