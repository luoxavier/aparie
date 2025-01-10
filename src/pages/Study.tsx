import { useState } from "react";
import { CreateCard } from "@/components/CreateCard";
import { Flashcard } from "@/components/Flashcard";
import { Button } from "@/components/ui/button";
import { shuffle } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Card {
  id: number;
  front: string;
  back: string;
}

const Study = () => {
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
      toast({
        title: "🎉 Congratulations!",
        description: "You've completed all the flashcards! Starting over with a fresh shuffle.",
        variant: "default",
      });

      if (isReviewingMistakes) {
        startStudying();
      } else if (mistakes.length > 0) {
        startReviewingMistakes();
      } else {
        setCurrentDeck(shuffle([...cards]));
        setCurrentCardIndex(0);
      }
    }
  };

  const getOtherAnswers = (currentCard: Card) => {
    return cards
      .filter(card => card.id !== currentCard.id)
      .map(card => card.back);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">Flashcards</h1>
        </div>

        {streak > 0 && (
          <div className="text-center mb-4 animate-slide-up">
            <span className="inline-block bg-primary text-white px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-full">
              🔥 Streak: {streak}
            </span>
          </div>
        )}

        {!isStudying ? (
          <div className="space-y-6 md:space-y-8">
            <CreateCard onSave={handleSaveCard} />

            {cards.length > 0 && (
              <div className="space-y-3 md:space-y-4">
                <Button
                  onClick={startStudying}
                  className="w-full bg-accent hover:bg-accent/90 text-sm md:text-base py-2 md:py-3"
                >
                  Start Studying ({cards.length} cards)
                </Button>

                {mistakes.length > 0 && (
                  <Button
                    onClick={startReviewingMistakes}
                    variant="outline"
                    className="w-full text-sm md:text-base py-2 md:py-3"
                  >
                    Review Mistakes ({mistakes.length} cards)
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {currentDeck.length > 0 && (
              <Flashcard
                front={currentDeck[currentCardIndex].front}
                back={currentDeck[currentCardIndex].back}
                otherAnswers={getOtherAnswers(currentDeck[currentCardIndex])}
                onResult={handleCardResult}
                onNext={handleNextCard}
              />
            )}
            <div className="text-center text-sm md:text-base text-muted-foreground">
              Card {currentCardIndex + 1} of {currentDeck.length}
              {isReviewingMistakes && " (Reviewing Mistakes)"}
            </div>
            <div className="fixed bottom-4 left-0 right-0 px-4 space-y-2 max-w-md mx-auto">
              <Button
                onClick={() => {
                  setIsStudying(false);
                  setCurrentCardIndex(0);
                }}
                variant="outline"
                className="w-full text-sm md:text-base py-2 md:py-3"
              >
                Exit Study Mode
              </Button>
              {!isReviewingMistakes && mistakes.length > 0 && (
                <Button
                  onClick={startReviewingMistakes}
                  variant="secondary"
                  className="w-full text-sm md:text-base py-2 md:py-3"
                >
                  Review Mistakes Now ({mistakes.length})
                </Button>
              )}
              {isReviewingMistakes && (
                <Button
                  onClick={startStudying}
                  variant="secondary"
                  className="w-full text-sm md:text-base py-2 md:py-3"
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

export default Study;
