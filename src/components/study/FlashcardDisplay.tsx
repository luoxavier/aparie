import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface FlashcardDisplayProps {
  currentCard?: {
    front: string;
    back: string;
  };
  deck: any[];
  isCorrect: boolean | null;
  showAnswer: boolean;
  onAnswer: (answer: string) => void;
  onReviewMistakes: () => void;
  streak?: number;
  mistakes?: { front: string; back: string }[];
}

export function FlashcardDisplay({ 
  currentCard, 
  deck, 
  isCorrect, 
  showAnswer, 
  onAnswer,
  onReviewMistakes,
  streak = 0,
  mistakes = []
}: FlashcardDisplayProps) {
  const navigate = useNavigate();

  // If there's no current card, show a message
  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <p className="text-lg text-gray-600">No flashcard available</p>
        <Button onClick={() => navigate("/profile")}>Return Home</Button>
      </div>
    );
  }

  const generateAnswerOptions = () => {
    // Always include the correct answer
    const options = [currentCard.back];
    
    // Get all unique answers from the deck excluding the current card's answer
    const allPossibleAnswers = [...new Set([
      ...deck.filter(card => card.back !== currentCard.back).map(card => card.back),
      ...mistakes.map(card => card.back)
    ])];
    
    // Shuffle the possible answers
    const shuffledAnswers = allPossibleAnswers.sort(() => Math.random() - 0.5);
    
    // Take the first 3 unique wrong answers
    const wrongAnswers = shuffledAnswers.slice(0, 3);
    
    // If we don't have enough wrong answers, use some from mistakes
    if (wrongAnswers.length < 3) {
      const additionalAnswers = mistakes
        .map(card => card.back)
        .filter(answer => !wrongAnswers.includes(answer) && answer !== currentCard.back)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3 - wrongAnswers.length);
      
      wrongAnswers.push(...additionalAnswers);
    }
    
    // Combine correct answer with wrong answers and shuffle
    const allAnswers = [...options, ...wrongAnswers];
    return allAnswers.sort(() => Math.random() - 0.5);
  };

  const glowIntensity = Math.min(streak * 0.2, 1);

  return (
    <div className="space-y-12">
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
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7 }}
              className="text-lg text-primary mt-4"
            >
              Answer: {currentCard.back}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-4 mb-12">
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
          className="w-full bg-secondary hover:bg-secondary/90"
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