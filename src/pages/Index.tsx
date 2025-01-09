import { useState } from "react";
import { CreateCard } from "@/components/CreateCard";
import { Flashcard } from "@/components/Flashcard";
import { Button } from "@/components/ui/button";

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

  const handleSaveCard = (front: string, back: string) => {
    setCards([...cards, { id: Date.now(), front, back }]);
  };

  const handleCardResult = (correct: boolean) => {
    if (correct) {
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }
    
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setIsStudying(false);
      setCurrentCardIndex(0);
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
              <Button
                onClick={() => setIsStudying(true)}
                className="w-full bg-accent hover:bg-accent/90"
              >
                Start Studying ({cards.length} cards)
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {cards.length > 0 && (
              <Flashcard
                front={cards[currentCardIndex].front}
                back={cards[currentCardIndex].back}
                otherAnswers={getOtherAnswers(cards[currentCardIndex])}
                onResult={handleCardResult}
              />
            )}
            <div className="text-center text-gray-600">
              Card {currentCardIndex + 1} of {cards.length}
            </div>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;