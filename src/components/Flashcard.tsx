import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { shuffle } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface FlashcardProps {
  front: string;
  back: string;
  otherAnswers: string[];
  onResult: (correct: boolean) => void;
  onNext: () => void;
}

export const Flashcard = ({ front, back, otherAnswers, onResult, onNext }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Filter out any answers that match the correct answer
    const uniqueAnswers = otherAnswers.filter(answer => answer !== back);
    // Take only the first 3 unique wrong answers
    const selectedWrongAnswers = uniqueAnswers.slice(0, 3);
    // Combine with correct answer and shuffle
    const allAnswers = [back, ...selectedWrongAnswers];
    setAnswers(shuffle(allAnswers));
  }, [back, otherAnswers]);

  const handleAnswer = (selectedAnswer: string) => {
    const isCorrect = selectedAnswer === back;
    setShowNotification(true);
    
    if (isCorrect) {
      toast({
        title: "Correct! 🎉",
        description: "Great job! Moving to next card...",
        variant: "default",
      });
    } else {
      toast({
        title: "Incorrect",
        description: `The correct answer was: ${back}`,
        variant: "destructive",
      });
    }
    
    onResult(isCorrect);
    
    // Show notification for 1 second before moving to next card
    setTimeout(() => {
      setShowNotification(false);
      setIsFlipped(false);
      onNext();
    }, 1000);
  };

  if (showNotification) {
    return (
      <div className="w-full max-w-sm mx-auto min-h-[16rem] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="text-center"
        >
          {/* Notification content is handled by toast */}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto perspective-1000">
      <motion.div
        className={`relative w-full cursor-pointer rounded-xl shadow-lg transition-all duration-500 preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <div
          className={`absolute w-full backface-hidden rounded-xl bg-white p-6 flex items-center justify-center text-center min-h-[16rem] ${
            isFlipped ? "hidden" : ""
          }`}
          onClick={() => setIsFlipped(true)}
        >
          <p className="text-2xl font-semibold text-gray-800">{front}</p>
        </div>
        <div
          className={`absolute w-full backface-hidden rounded-xl bg-primary p-6 flex flex-col items-center justify-center rotate-y-180 min-h-[16rem] ${
            !isFlipped ? "hidden" : ""
          }`}
        >
          <div className="grid grid-cols-1 gap-4 w-full">
            {answers.map((answer, index) => (
              <Button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(answer);
                }}
                variant="secondary"
                className="w-full text-left py-4 h-auto"
              >
                {answer}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};