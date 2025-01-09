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

  const handleCardResult = (correct: boolean) => {
    const currentCard = deck[currentCardIndex];
    
    if (correct) {
      setStreak(streak + 1);
    } else {
      setStreak(0);
      if (!mistakes.find(card => card.id === currentCard.id)) {
        setMistakes([...mistakes, currentCard]);
      }
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex < deck.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      onExit();
      setCurrentCardIndex(0);
    }
  };

  const getOtherAnswers = (currentCard: FlashcardType) => {
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
        front={deck[currentCardIndex].front}
        back={deck[currentCardIndex].back}
        otherAnswers={getOtherAnswers(deck[currentCardIndex])}
        onResult={handleCardResult}
        onNext={handleNextCard}
      />

      <div className="text-center text-gray-600">
        Card {currentCardIndex + 1} of {deck.length}
      </div>
    </div>
  );
}