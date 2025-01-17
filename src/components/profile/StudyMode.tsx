import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StudySession } from "@/components/study/StudySession";
import { StudyControls } from "@/components/study/StudyControls";
import { StudyProgress } from "@/components/study/StudyProgress";

interface StudyModeProps {
  deck: FlashcardType[];
  onExit: () => void;
}

interface FlashcardType {
  id: string;
  front: string;
  back: string;
}

export function StudyMode({ deck, onExit }: StudyModeProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mistakes, setMistakes] = useState<FlashcardType[]>([]);
  const [isReviewingMistakes, setIsReviewingMistakes] = useState(false);
  const [currentReviewMistakes, setCurrentReviewMistakes] = useState<FlashcardType[]>([]);

  const handleCardResult = (correct: boolean) => {
    const currentCard = isReviewingMistakes ? currentReviewMistakes[currentCardIndex] : deck[currentCardIndex];
    
    if (correct) {
      setStreak(streak + 1);
      if (isReviewingMistakes) {
        setCurrentReviewMistakes(prev => prev.filter(card => card.id !== currentCard.id));
      }
    } else {
      setStreak(0);
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
          setIsReviewingMistakes(false);
          setCurrentCardIndex(0);
          setMistakes([]);
        } else {
          setCurrentCardIndex(0);
        }
      }
    } else if (currentCardIndex < deck.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      onExit();
      setCurrentCardIndex(0);
    }
  };

  const handleReviewMistakes = () => {
    setIsReviewingMistakes(true);
    setCurrentReviewMistakes([...mistakes]);
    setCurrentCardIndex(0);
  };

  const currentCards = isReviewingMistakes ? currentReviewMistakes : deck;
  const currentCard = currentCards[currentCardIndex];

  return (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        onClick={onExit}
        className="mb-4"
      >
        ← Back to Folders
      </Button>
      
      <StudySession
        currentCard={currentCard}
        deck={deck}
        onResult={handleCardResult}
        onNext={handleNextCard}
        streak={streak}
      />

      <StudyProgress
        currentIndex={currentCardIndex}
        totalCards={currentCards.length}
        mode={null}
      />

      <StudyControls
        onExit={onExit}
        onReviewMistakes={handleReviewMistakes}
        mistakesCount={mistakes.length}
        isReviewingMistakes={isReviewingMistakes}
      />
    </div>
  );
}