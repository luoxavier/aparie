import { useState } from "react";
import { CreateCard } from "@/components/CreateCard";
import { Flashcard } from "@/components/Flashcard";
import { Button } from "@/components/ui/button";
import { shuffle } from "@/lib/utils";

interface Card {
  id: number;
  front: string;
  back: string;
}

const Index = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [isStudying, setIsStudying] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mistakes, setMistakes] = useState<Card[]>([]);
  const [isReviewingMistakes, setIsReviewingMistakes] = useState(false);
  const [currentDeck, setCurrentDeck] = useState<Card[]>([]);

  const handleSaveCard = (front: string, back: string) => {
    setCards([...cards, { id: Date.now(), front, back }]);
  };

  const startStudying = () => {
    setIsStudying(true);
    setIsReviewingMistakes(false);
    setCurrentCardIndex(0);
    setStreak(0);
    setMistakes([]);
    setCurrentDeck(shuffle([...cards]));
  };

  const startReviewingMistakes = () => {
    if (mistakes.length > 0) {
      setIsStudying(true);
      setIsReviewingMistakes(true);
      setCurrentCardIndex(0);
      setStreak(0);
      setCurrentDeck(shuffle([...mistakes]));
    }
  };

  const handleCardResult = (correct: boolean) => {
    const currentCard = currentDeck[currentCardIndex];
    
    if (correct) {
      setStreak(streak + 1);
      if (isReviewingMistakes) {
        setMistakes(mistakes.filter(card => card.id !== currentCard.id));
      }
    } else {
      setStreak(0);
      if (!isReviewingMistakes && !mistakes.find(card => card.id === currentCard.id)) {
        setMistakes([...mistakes, currentCard]);
      }
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex < currentDeck.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      if (isReviewingMistakes) {
        // If we're done reviewing mistakes, go back to study mode
        startStudying();
      } else if (mistakes.length > 0) {
        // If we have mistakes, start reviewing them
        startReviewingMistakes();
      } else {
        // If no mistakes, restart with shuffled deck
        setCurrentDeck(shuffle([...cards]));
        setCurrentCardIndex(0);
      }
    }
  };

  // Get other answers from cards excluding the current card
  const getOtherAnswers = (currentCard: Card) => {
    return cards
      .filter(card => card.id !== currentCard.id)
      .map(card => card.back);
  };

  return (
    <div className="min-h-screen bg-[#F8F7FF] p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Flashcards
        </h1>
        
        {streak > 0 && (
          <div className="text-center mb-4 animate-slide-up">
            <span className="inline-block bg-primary text-white px-4 py-2 rounded-full">
              🔥 Streak: {streak}
            </span>
          </div>
        )}

        {!isStudying ? (
          <div className="space-y-8">
            <CreateCard onSave={handleSaveCard} />
            
            {cards.length > 0 && (
              <div className="space-y-4">
                <Button
                  onClick={startStudying}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  Start Studying ({cards.length} cards)
                </Button>
                
                {mistakes.length > 0 && (
                  <Button
                    onClick={startReviewingMistakes}
                    variant="outline"
                    className="w-full"
                  >
                    Review Mistakes ({mistakes.length} cards)
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {currentDeck.length > 0 && (
              <Flashcard
                front={currentDeck[currentCardIndex].front}
                back={currentDeck[currentCardIndex].back}
                otherAnswers={getOtherAnswers(currentDeck[currentCardIndex])}
                onResult={handleCardResult}
                onNext={handleNextCard}
              />
            )}
            <div className="text-center text-gray-600">
              Card {currentCardIndex + 1} of {currentDeck.length}
              {isReviewingMistakes && " (Reviewing Mistakes)"}
            </div>
            <div className="space-y-2">
              <Button
                onClick={() => {
                  setIsStudying(false);
                  setCurrentCardIndex(0);
                }}
                variant="outline"
                className="w-full"
              >
                Exit Study Mode
              </Button>
              {!isReviewingMistakes && mistakes.length > 0 && (
                <Button
                  onClick={startReviewingMistakes}
                  variant="secondary"
                  className="w-full"
                >
                  Review Mistakes Now ({mistakes.length})
                </Button>
              )}
              {isReviewingMistakes && (
                <Button
                  onClick={startStudying}
                  variant="secondary"
                  className="w-full"
                >
                  Back to Study Mode
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;