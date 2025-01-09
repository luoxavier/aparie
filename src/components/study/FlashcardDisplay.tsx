import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { generateAnswerOptions } from "@/utils/flashcard-utils";
import { FlashcardContent } from "./FlashcardContent";
import { AnswerOptions } from "./AnswerOptions";

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

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <p className="text-lg text-gray-600">No flashcard available</p>
        <Button onClick={() => navigate("/profile")}>Return Home</Button>
      </div>
    );
  }

  const answerOptions = !showAnswer ? generateAnswerOptions(currentCard, deck, mistakes) : [];

  return (
    <div className="space-y-12">
      <AnimatePresence mode="wait">
        <FlashcardContent
          front={currentCard.front}
          back={currentCard.back}
          showAnswer={showAnswer}
          isCorrect={isCorrect}
          streak={streak}
          onClick={() => {
            if (showAnswer) {
              onAnswer(currentCard.back);
            }
          }}
        />
      </AnimatePresence>

      {!showAnswer && <AnswerOptions options={answerOptions} onAnswer={onAnswer} />}

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