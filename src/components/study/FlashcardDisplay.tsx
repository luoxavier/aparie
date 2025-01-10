import { AnimatePresence } from "framer-motion";
import { generateAnswerOptions } from "@/utils/flashcard-utils";
import { FlashcardContent } from "./FlashcardContent";
import { AnswerOptions } from "./AnswerOptions";
import { StudyControls } from "./StudyControls";

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
  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <p className="text-lg text-gray-600">No flashcard available</p>
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

      <StudyControls
        onExit={() => {}}
        onReviewMistakes={onReviewMistakes}
        mistakesCount={mistakes.length}
        isReviewingMistakes={false}
      />
    </div>
  );
}