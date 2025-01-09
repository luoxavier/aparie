import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flashcard } from "@/components/Flashcard";

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
          // All mistakes corrected
          setIsReviewingMistakes(false);
          setCurrentCardIndex(0);
          setMistakes([]);
        } else {
          // Start new review cycle with remaining mistakes
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

  const getOtherAnswers = (currentCard: FlashcardType) => {
    // Always use the full deck for answer options
    return deck
      .filter(card => card.id !== currentCard.id)
      .map(card => card.back);
  };

  return (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        onClick={onExit}
        className="mb-4"
      >
        ← Back to Folders
      </Button>
      
      {streak > 0 && (
        <div className="text-center mb-4">
          <span className="inline-block bg-primary text-white px-4 py-2 rounded-full">
            🔥 Streak: {streak}
          </span>
        </div>
      )}

      <Flashcard
        front={currentCard.front}
        back={currentCard.back}
        otherAnswers={getOtherAnswers(currentCard)}
        onResult={handleCardResult}
        onNext={handleNextCard}
      />

      <div className="text-center text-gray-600">
        Card {currentCardIndex + 1} of {currentCards.length}
      </div>

      <div className="fixed bottom-4 left-0 right-0 px-4 space-y-2 max-w-md mx-auto">
        <Button
          variant="secondary"
          onClick={handleReviewMistakes}
          className="w-full bg-secondary hover:bg-secondary/90"
          disabled={mistakes.length === 0 || isReviewingMistakes}
        >
          Review Mistakes
        </Button>
        <Button
          variant="outline"
          onClick={onExit}
          className="w-full"
        >
          Return Home
        </Button>
      </div>
    </div>
  );
}