import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FlashcardDisplayProps {
  currentCard: {
    front: string;
    back: string;
  };
  deck: any[];
  isCorrect: boolean | null;
  showAnswer: boolean;
  onAnswer: (answer: string) => void;
}

export function FlashcardDisplay({ 
  currentCard, 
  deck, 
  isCorrect, 
  showAnswer, 
  onAnswer 
}: FlashcardDisplayProps) {
  // Get 3 random wrong answers from the deck
  const getWrongAnswers = () => {
    return deck
      .filter(card => card.back !== currentCard.back) // Exclude correct answer
      .sort(() => Math.random() - 0.5) // Shuffle
      .slice(0, 3) // Take only 3 wrong answers
      .map(card => card.back);
  };

  // Combine correct answer with wrong answers and shuffle
  const getAllAnswers = () => {
    const wrongAnswers = getWrongAnswers();
    const allAnswers = [...wrongAnswers, currentCard.back];
    return allAnswers.sort(() => Math.random() - 0.5);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.front}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "bg-white rounded-lg p-8 min-h-[200px] flex flex-col items-center justify-center relative",
            isCorrect === true && "animate-[sparkle_1s_ease-in-out]",
            isCorrect === false && "animate-[glow-red_1s_ease-in-out]"
          )}
          onClick={() => {
            if (showAnswer) {
              onAnswer(currentCard.back);
            }
          }}
        >
          <p className="text-xl font-medium text-center">
            {currentCard.front}
          </p>
          {showAnswer && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg text-red-500 mt-4"
            >
              Answer: {currentCard.back}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-4">
        {!showAnswer && getAllAnswers().map((answer, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto py-4 text-left"
            onClick={() => onAnswer(answer)}
          >
            {answer}
          </Button>
        ))}
      </div>
    </div>
  );
}