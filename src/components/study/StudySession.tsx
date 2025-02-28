
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
        const accuracyPercent = totalAnswers > 0 ? Math.floor((correctAnswers / totalAnswers) * 100) : 0;
        const maxStreak = Math.max(highestStreak, streak);
        
        // Temporarily use separate updates until the RPC function is available
        // Time-based quests
        await updateTimeBasedQuests(elapsedMinutes);
        
        // Accuracy-based quests
        await updateAccuracyQuests(accuracyPercent);
        
        // Streak-based quests
        await updateStreakQuests(maxStreak);
        
        // Update user streak
        await updateUserStreak();
        
        // Clear the timeout
        questsUpdateTimeoutRef.current = null;
      } catch (error) {
        console.error('Error updating quest progress:', error);
      }
    }, 1000);
  };

  // Helper functions for updating different types of quests
  const updateTimeBasedQuests = async (minutes: number) => {
    if (!user) return;
    
    // Get all time-based quests
    const { data: timeQuests, error } = await supabase
      .from('user_quests')
      .select('*, quests(*)')
      .eq('user_id', user.id)
      .gte('expires_at', new Date().toISOString())
      .filter('quests.type', 'eq', 'infinite');
      
    if (error) {
      console.error('Error fetching time quests:', error);
      return;
    }
    
    // Update each quest if needed
    for (const quest of timeQuests || []) {
      if (!quest.completed && quest.quests && minutes > quest.progress) {
        const newProgress = Math.min(minutes, quest.quests.requirement_count);
        const isCompleted = newProgress >= quest.quests.requirement_count;
        
        await supabase
          .from('user_quests')
          .update({
            progress: newProgress,
            completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
          })
          .eq('id', quest.id);
      }
    }
  };
  
  const updateAccuracyQuests = async (accuracyPercent: number) => {
    if (!user) return;
    
    // Get all accuracy-based quests
    const { data: accuracyQuests, error } = await supabase
      .from('user_quests')
      .select('*, quests(*)')
      .eq('user_id', user.id)
      .gte('expires_at', new Date().toISOString())
      .or('quests.type.eq.playlist_public,quests.type.eq.playlist_private');
      
    if (error) {
      console.error('Error fetching accuracy quests:', error);
      return;
    }
    
    // Update each quest if needed
    for (const quest of accuracyQuests || []) {
      if (!quest.completed && quest.quests && accuracyPercent > quest.progress) {
        const isCompleted = accuracyPercent >= quest.quests.requirement_count;
        
        await supabase
          .from('user_quests')
          .update({
            progress: accuracyPercent,
            completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
          })
          .eq('id', quest.id);
      }
    }
  };
  
  const updateStreakQuests = async (streakCount: number) => {
    if (!user) return;
    
    // Get all streak-based quests
    const { data: streakQuests, error } = await supabase
      .from('user_quests')
      .select('*, quests(*)')
      .eq('user_id', user.id)
      .gte('expires_at', new Date().toISOString())
      .filter('quests.type', 'eq', 'mastery');
      
    if (error) {
      console.error('Error fetching streak quests:', error);
      return;
    }
    
    // Update each quest if needed
    for (const quest of streakQuests || []) {
      if (!quest.completed && quest.quests && streakCount > quest.progress) {
        const isCompleted = streakCount >= quest.quests.requirement_count;
        
        await supabase
          .from('user_quests')
          .update({
            progress: streakCount,
            completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
          })
          .eq('id', quest.id);
      }
    }
  };
  
  const updateUserStreak = async () => {
    if (!user) return;
    
    try {
      // Update the user streak for today
      await supabase
        .from('user_streaks')
        .update({ last_activity_date: new Date().toISOString().split('T')[0] })
        .eq('user_id', user.id)
        .lt('last_activity_date', new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error updating user streak:', error);
    }
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
