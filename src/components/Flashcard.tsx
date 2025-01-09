import { useState } from "react";
import { motion } from "framer-motion";

interface FlashcardProps {
  front: string;
  back: string;
  onResult: (correct: boolean) => void;
}

export const Flashcard = ({ front, back, onResult }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="w-full max-w-sm mx-auto perspective-1000">
      <motion.div
        className={`relative w-full h-64 cursor-pointer rounded-xl shadow-lg transition-all duration-500 preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        onClick={handleFlip}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <div
          className={`absolute w-full h-full backface-hidden rounded-xl bg-white p-6 flex items-center justify-center text-center ${
            isFlipped ? "hidden" : ""
          }`}
        >
          <p className="text-2xl font-semibold text-gray-800">{front}</p>
        </div>
        <div
          className={`absolute w-full h-full backface-hidden rounded-xl bg-primary p-6 flex flex-col items-center justify-center rotate-y-180 ${
            !isFlipped ? "hidden" : ""
          }`}
        >
          <p className="text-2xl font-semibold text-white mb-4">{back}</p>
          <div className="flex gap-4 mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResult(false);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Incorrect
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResult(true);
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Correct
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};