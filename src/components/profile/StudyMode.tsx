import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StudySession } from "@/components/study/StudySession";
import { StudyControls } from "@/components/study/StudyControls";
import { StudyProgress } from "@/components/study/StudyProgress";
import { shuffle } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { playSound, vibrate } from "@/utils/sound";
import { useAuth } from "@/contexts/AuthContext";

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

export function StudyMode({ deck, onExit, mode }: StudyModeProps) {
  const { updateStreak } = useAuth();
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
