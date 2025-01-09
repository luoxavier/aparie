import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FlashcardContentProps {
  front: string;
  back?: string;
  showAnswer: boolean;
  isCorrect: boolean | null;
  streak: number;
  onClick: () => void;
}

export function FlashcardContent({
  front,
  back,
  showAnswer,
  isCorrect,
  streak,
  onClick
}: FlashcardContentProps) {
  const glowIntensity = Math.min(streak * 0.2, 1);

  return (
    <motion.div
      key={front}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "bg-white rounded-lg p-8 min-h-[200px] flex flex-col items-center justify-center relative border border-gray-200 cursor-pointer",
        isCorrect === true && "animate-[sparkle_0.7s_ease-in-out]",
        isCorrect === false && "animate-[glow-red_1s_ease-in-out]",
        streak > 0 && `shadow-[0_0_${20 * glowIntensity}px_${10 * glowIntensity}px_rgba(155,135,245,${glowIntensity})]`
      )}
      onClick={onClick}
    >
      <p className="text-2xl font-semibold text-center">{front}</p>
      {showAnswer && back && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.7 }}
          className="text-lg text-primary mt-4"
        >
          Answer: {back}
        </motion.p>
      )}
    </motion.div>
  );
}