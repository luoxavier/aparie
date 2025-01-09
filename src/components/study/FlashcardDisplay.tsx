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
        {!showAnswer && deck.map((card, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto py-4 text-left"
            onClick={() => onAnswer(card.back)}
          >
            {card.back}
          </Button>
        )).sort(() => Math.random() - 0.5).slice(0, 4)}
      </div>
    </div>
  );
}