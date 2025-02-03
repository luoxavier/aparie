import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { StudySession } from "@/components/study/StudySession";
import { StudyControls } from "@/components/study/StudyControls";
import { StudyProgress } from "@/components/study/StudyProgress";
import { shuffle } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { playSound, vibrate } from "@/utils/sound";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface StudyModeProps {
  deck: FlashcardType[];
  onExit: () => void;
  mode: "normal" | "infinite" | "mastery" | null;
}

interface FlashcardType {
  id: string;
  front: string;
  back: string;
  creator_id: string;
}

const INACTIVITY_TIMEOUT = 15000; // 15 seconds

export function StudyMode({ deck, onExit, mode }: StudyModeProps) {
  const { user, updateStreak } = useAuth();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mistakes, setMistakes] = useState<FlashcardType[]>([]);
  const [isReviewingMistakes, setIsReviewingMistakes] = useState(false);
  const [currentReviewMistakes, setCurrentReviewMistakes] = useState<FlashcardType[]>([]);
  const [shuffledDeck, setShuffledDeck] = useState(() => shuffle([...deck]));
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [infiniteCycles, setInfiniteCycles] = useState(0);
  const [perfectCycles, setPerfectCycles] = useState(0);
  const [hasUpdatedStreak, setHasUpdatedStreak] = useState(false);
  
  const lastActivityRef = useRef(Date.now());
  const studyTimeRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Start tracking study time
    const updateStudyTime = async () => {
      const currentTime = Date.now();
      if (currentTime - lastActivityRef.current <= INACTIVITY_TIMEOUT) {
        studyTimeRef.current += 1;
        
        // Update quest progress every minute
        if (studyTimeRef.current % 60 === 0) {
          const minutes = Math.floor(studyTimeRef.current / 60);
          
          // Log the current UTC time for testing
          console.log('Current UTC time:', new Date().toISOString());
          
          const { data: timeQuests, error: questError } = await supabase
            .from('user_quests')
            .select('*, quests(*)')
            .eq('user_id', user?.id)
            .gte('expires_at', new Date().toISOString())
            .filter('quests.type', 'eq', 'infinite');

          if (questError) {
            console.error('Error fetching quests:', questError);
            return;
          }

          console.log('Active quests:', timeQuests);

          if (timeQuests) {
            for (const quest of timeQuests) {
              if (!quest.completed && quest.quests) {
                const newProgress = Math.min(minutes, quest.quests.requirement_count);
                
                if (newProgress > quest.progress) {
                  const { data: updatedQuest, error: updateError } = await supabase
                    .from('user_quests')
                    .update({ 
                      progress: newProgress,
                      completed: newProgress >= quest.quests.requirement_count,
                      completed_at: newProgress >= quest.quests.requirement_count ? new Date().toISOString() : null
                    })
                    .eq('id', quest.id)
                    .select()
                    .single();

                  if (updateError) {
                    console.error('Error updating quest:', updateError);
                    return;
                  }

                  if (updatedQuest?.completed) {
                    playSound('complete');
                    toast({
                      title: "Quest Completed! 🎉",
                      description: `You've earned ${quest.quests.xp_reward} XP!`,
                    });

                    // Log quest completion time for testing
                    console.log('Quest completed at UTC:', new Date().toISOString());
                  }
                }
              }
            }
          }
        }
      }
    };

    timerRef.current = setInterval(updateStudyTime, 1000);

    // Log initial quest and streak state for testing
    const logInitialState = async () => {
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      console.log('Current streak state:', streakData);
      
      const { data: questData } = await supabase
        .from('user_quests')
        .select('*, quests(*)')
        .eq('user_id', user?.id);
      
      console.log('Current quests state:', questData);
    };

    logInitialState();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user]);

  // Update last activity timestamp on user interaction
  useEffect(() => {
    const updateLastActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', updateLastActivity);
    window.addEventListener('keydown', updateLastActivity);
    window.addEventListener('click', updateLastActivity);

    return () => {
      window.removeEventListener('mousemove', updateLastActivity);
      window.removeEventListener('keydown', updateLastActivity);
      window.removeEventListener('click', updateLastActivity);
    };
  }, []);

  const handleCardResult = (correct: boolean) => {
    const currentCard = isReviewingMistakes 
      ? currentReviewMistakes[currentCardIndex] 
      : shuffledDeck[currentCardIndex];
    
    if (correct) {
      setStreak(streak + 1);
      setScore(score + 1);
      if (isReviewingMistakes) {
        setCurrentReviewMistakes(prev => prev.filter(card => card.id !== currentCard.id));
      }
    } else {
      setStreak(0);
      if (mode === "mastery") {
        setPerfectCycles(0);
        toast({
          title: "Mistake made!",
          description: "Perfect cycle streak reset. Keep practicing!",
          variant: "destructive",
        });
      }
      if (!mistakes.find(card => card.id === currentCard.id)) {
        setMistakes([...mistakes, currentCard]);
      }
      if (isReviewingMistakes) {
        setCurrentReviewMistakes(prev => {
          if (!prev.find(card => card.id === currentCard.id)) {
            return [...prev, currentCard];
          }
          return prev;
        });
      }
    }
  };

  const handleNextCard = () => {
    if (isReviewingMistakes) {
      if (currentCardIndex < currentReviewMistakes.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        if (currentReviewMistakes.length === 0) {
          if (mode === "infinite" || mode === "mastery") {
            startNewCycle();
          } else {
            setShowScore(true);
          }
        } else {
          setCurrentCardIndex(0);
          setCurrentReviewMistakes(shuffle([...currentReviewMistakes]));
        }
      }
    } else if (currentCardIndex < shuffledDeck.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      if (mode === "infinite") {
        if (mistakes.length === 0) {
          setPerfectCycles(prev => prev + 1);
        } else {
          setPerfectCycles(0);
        }
        startNewCycle();
      } else if (mode === "mastery") {
        if (mistakes.length === 0) {
          const newPerfectCycles = perfectCycles + 1;
          setPerfectCycles(newPerfectCycles);
          if (newPerfectCycles >= 3) {
            playSound('complete');
            vibrate('complete');
            toast({
              title: "Mastery Achieved! 🎉",
              description: "Congratulations! You've completed 3 perfect cycles!",
              variant: "default",
            });
            setShowScore(true);
          } else {
            toast({
              title: `Perfect Cycle ${newPerfectCycles}/3! 🌟`,
              description: "Keep going! You're doing great!",
              variant: "default",
            });
            startNewCycle();
          }
        } else {
          setPerfectCycles(0);
          startNewCycle();
        }
      } else if (mistakes.length > 0) {
        startReviewMode();
      } else {
        setShowScore(true);
      }
    }
  };

  const handleStudyComplete = async () => {
    if (!hasUpdatedStreak) {
      await updateStreak();
      setHasUpdatedStreak(true);
    }
    setShowScore(true);
  };

  const startNewCycle = () => {
    setInfiniteCycles(prev => prev + 1);
    setShuffledDeck(shuffle([...deck]));
    setCurrentCardIndex(0);
    setStreak(0);
    setMistakes([]);
    setScore(0);
  };

  const startReviewMode = () => {
    setIsReviewingMistakes(true);
    setCurrentReviewMistakes(shuffle([...mistakes]));
    setCurrentCardIndex(0);
    setMistakes([]);
  };

  const restartStudy = () => {
    setShuffledDeck(shuffle([...deck]));
    setCurrentCardIndex(0);
    setStreak(0);
    setMistakes([]);
    setIsReviewingMistakes(false);
    setCurrentReviewMistakes([]);
    setScore(0);
    setShowScore(false);
    setInfiniteCycles(0);
    setPerfectCycles(0);
    setHasUpdatedStreak(false);
  };

  const currentCards = isReviewingMistakes ? currentReviewMistakes : shuffledDeck;
  const currentCard = currentCards[currentCardIndex];

  if (showScore) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="space-y-4 text-center max-w-md mx-auto">
          <h2 className="text-3xl font-bold mb-8">
            {mode === "mastery" ? "Mastery Complete! 🎉" : `Final Score: ${score}/${deck.length}`}
          </h2>
          <div className="space-y-4">
            <Button 
              onClick={restartStudy}
              className="w-full"
            >
              Study Again
            </Button>
            <Button 
              variant="outline"
              onClick={onExit}
              className="w-full"
            >
              Return to Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <Button 
        variant="outline" 
        onClick={onExit}
        className="mb-4"
      >
        ← Back to Study Menu
      </Button>
      
      {currentCard && (
        <StudySession
          currentCard={currentCard}
          deck={deck}
          onResult={handleCardResult}
          onNext={handleNextCard}
          streak={streak}
        />
      )}

      <StudyProgress
        currentIndex={currentCardIndex}
        totalCards={currentCards.length}
        mode={mode}
        isReviewMode={isReviewingMistakes}
        infiniteCycles={infiniteCycles}
        perfectCycles={perfectCycles}
      />

      <StudyControls
        onExit={onExit}
        onReviewMistakes={startReviewMode}
        mistakesCount={mistakes.length}
        isReviewingMistakes={isReviewingMistakes}
      />
    </div>
  );
}
