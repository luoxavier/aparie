import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface FlashcardDisplayProps {
  currentCard: {
    front: string;
    back: string;
  };
  deck: any[];
  isCorrect: boolean | null;
  showAnswer: boolean;
  onAnswer: (answer: string) => void;
  onReviewMistakes: () => void;
}

export function FlashcardDisplay({ 
  currentCard, 
  deck, 
  isCorrect, 
  showAnswer, 
  onAnswer,
  onReviewMistakes
}: FlashcardDisplayProps) {
  const navigate = useNavigate();

  // Generate answer options including the correct answer
  const generateAnswerOptions = () => {
    // Start with the correct answer
    const options = [currentCard.back];
    
    // Get wrong answers from the deck, excluding the current card
    const wrongAnswers = deck
      .filter(card => card.back !== currentCard.back)
      .map(card => card.back)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    // Combine and shuffle all answers
    return [...options, ...wrongAnswers]
      .sort(() => Math.random() - 0.5);
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
            "bg-white rounded-lg p-8 min-h-[200px] flex flex-col items-center justify-center relative border border-gray-200",
            isCorrect === true && "animate-[sparkle_1s_ease-in-out]",
            isCorrect === false && "animate-[glow-red_1s_ease-in-out]"
          )}
          onClick={() => {
            if (showAnswer) {
              onAnswer(currentCard.back);
            }
          }}
        >
          <p className="text-2xl font-semibold text-center">
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
        {!showAnswer && generateAnswerOptions().map((answer, index) => (
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

      <div className="flex flex-col gap-4 mt-8">
        <Button
          variant="outline"
          onClick={onReviewMistakes}
        >
          Review Mistakes
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate("/profile")}
        >
          Return Home
        </Button>
      </div>
    </div>
  );
}