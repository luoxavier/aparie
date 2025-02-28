
import { useState, useEffect, useRef } from "react";
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
  const [highestStreak, setHighestStreak] = useState(0);
  
  // Use refs to prevent unnecessary re-renders and updates
  const questsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastQuestUpdateTimeRef = useRef<number>(0);

  // Debounced quest progress updates to reduce database calls
  const updateQuestProgress = () => {
    // Only update quests every 60 seconds at most
    const currentTime = Date.now();
    if (currentTime - lastQuestUpdateTimeRef.current < 60000) {
      return;
    }
    
    lastQuestUpdateTimeRef.current = currentTime;
    
    if (questsUpdateTimeoutRef.current) {
      clearTimeout(questsUpdateTimeoutRef.current);
    }
    
    questsUpdateTimeoutRef.current = setTimeout(async () => {
      if (!user) return;
      
      try {
        // Update study time quest progress
        const currentTime = Date.now();
        if (currentTime - lastActivityTime > 15000) {
          return;
        }

        const elapsedMinutes = Math.floor((currentTime - studyStartTime) / 60000);
        
        // Use a single RPC call to update quest progress
        await supabase.rpc('update_study_quests', {
          user_id_param: user.id,
          minutes_studied: elapsedMinutes,
          accuracy_percent: totalAnswers > 0 ? Math.floor((correctAnswers / totalAnswers) * 100) : 0,
          streak_count: Math.max(highestStreak, streak)
        });
        
        // Clear the timeout
        questsUpdateTimeoutRef.current = null;
      } catch (error) {
        console.error('Error updating quest progress:', error);
      }
    }, 1000);
  };

  // Update study time quest progress
  useEffect(() => {
    if (!user) return;
    
    const studyTimeInterval = setInterval(() => {
      updateQuestProgress();
    }, 60000); // Check and possibly update every minute
    
    return () => {
      clearInterval(studyTimeInterval);
      if (questsUpdateTimeoutRef.current) {
        clearTimeout(questsUpdateTimeoutRef.current);
      }
    };
  }, [user, lastActivityTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (questsUpdateTimeoutRef.current) {
        clearTimeout(questsUpdateTimeoutRef.current);
      }
    };
  }, []);

  const handleAnswer = async (isCorrect: boolean) => {
    setLastActivityTime(Date.now());
    setTotalAnswers(prev => prev + 1);
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      const newStreak = streak + 1;
      if (newStreak > highestStreak) {
        setHighestStreak(newStreak);
      }
    }
    
    onResult(isCorrect);
    
    // Trigger an update after significant progress (but not every answer)
    if (totalAnswers % 5 === 0) {
      updateQuestProgress();
    }
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
