import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { shuffle } from "@/lib/utils";

interface FlashcardProps {
  front: string;
  back: string;
  otherAnswers: string[];
  onResult: (correct: boolean) => void;
}

export const Flashcard = ({ front, back, otherAnswers, onResult }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);

  // Initialize answers when component mounts or when otherAnswers change
  useState(() => {
    const allAnswers = [back, ...otherAnswers.slice(0, 3)];
    setAnswers(shuffle(allAnswers));
  });

  const handleAnswer = (selectedAnswer: string) => {
    const isCorrect = selectedAnswer === back;
    onResult(isCorrect);
  };

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