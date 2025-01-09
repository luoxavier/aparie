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
  streak?: number;
}

export function FlashcardDisplay({ 
  currentCard, 
  deck, 
  isCorrect, 
  showAnswer, 
  onAnswer,
  onReviewMistakes,
  streak = 0
}: FlashcardDisplayProps) {
  const navigate = useNavigate();

  const generateAnswerOptions = () => {
    // Always include the correct answer
    const options = [currentCard.back];
    
    // Get all unique answers from the deck
    const allAnswers = [...new Set(deck.map(card => card.back))];
    
    // Filter out the current correct answer and shuffle remaining answers
    const wrongAnswers = allAnswers
      .filter(answer => answer !== currentCard.back)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    // Combine and shuffle all options
    return [...options, ...wrongAnswers]
      .sort(() => Math.random() - 0.5);
  };

  const glowIntensity = Math.min(streak * 0.2, 1);

  return (
    <div className="space-y-8"> {/* Increased spacing from 6 to 8 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.front}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "bg-white rounded-lg p-8 min-h-[200px] flex flex-col items-center justify-center relative border border-gray-200 cursor-pointer",
            isCorrect === true && "animate-[sparkle_0.7s_ease-in-out]",
            isCorrect === false && "animate-[glow-red_1s_ease-in-out]",
            streak > 0 && `shadow-[0_0_${20 * glowIntensity}px_${10 * glowIntensity}px_rgba(155,135,245,${glowIntensity})]`
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

      <div className="grid grid-cols-2 gap-4 mb-8"> {/* Added mb-8 for extra spacing */}
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

      <div className="fixed bottom-4 left-0 right-0 px-4 space-y-2 max-w-md mx-auto">
        <Button
          variant="secondary"
          onClick={onReviewMistakes}
          className="w-full bg-primary/90 hover:bg-primary" // Changed to use primary color
        >
          Review Mistakes
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/profile")}
          className="w-full"
        >
          Return Home
        </Button>
      </div>
    </div>
  );
}