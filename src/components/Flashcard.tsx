import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { shuffle } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { playSound, vibrate } from "@/utils/sound";

interface FlashcardProps {
  front: string;
  back: string;
  otherAnswers: string[];
  onResult: (correct: boolean) => void;
  onNext: () => void;
  creatorId?: string;
  playlistName?: string;
  streak?: number;
}

export const Flashcard = ({ 
  front, 
  back, 
  otherAnswers, 
  onResult, 
  onNext,
  creatorId,
  playlistName,
  streak = 0
}: FlashcardProps) => {
  const { user } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [maintainStreak, setMaintainStreak] = useState(true);

  useEffect(() => {
    if (!answers.length) {
      // Filter out any instances of the correct answer from otherAnswers
      const uniqueAnswers = otherAnswers.filter(answer => answer !== back);
      
      // Take up to 3 wrong answers
      const selectedWrongAnswers = uniqueAnswers.slice(0, 3);
      
      // Always include the correct answer and shuffle with wrong answers
      const allAnswers = shuffle([back, ...selectedWrongAnswers]);
      
      setAnswers(allAnswers);
    }
  }, [back, otherAnswers, answers.length]);

  const updateLeaderboard = async (points: number) => {
    if (!user?.id || !creatorId || !playlistName) return;

    try {
      const { error } = await supabase.rpc(
        'update_leaderboard_score',
        {
          user_id_param: user.id,
          playlist_name_param: playlistName,
          creator_id_param: creatorId,
          score: points
        }
      );

      if (error) throw error;
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (selectedAnswer) return; // Prevent multiple answers
    
    setSelectedAnswer(answer);
    const correct = answer === back;
    setIsCorrect(correct);
    
    if (correct) {
      playSound('correct');
      vibrate('correct');
      await updateLeaderboard(10);
      toast({
        title: "Correct! 🎉",
        description: "+10 points!",
      });
      // Use a consistent animation duration of 500ms
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        onResult(true);
        onNext();
      }, 500);
    } else {
      playSound('incorrect');
      vibrate('incorrect');
      setMaintainStreak(false);
      toast({
        title: "Incorrect",
        description: `The correct answer is: ${back}`,
        variant: "destructive",
      });
      onResult(false);
    }
  };

  const handleScreenClick = () => {
    if (selectedAnswer && !isCorrect) {
      setSelectedAnswer(null);
      setIsCorrect(null);
      onNext();
    }
  };

  // Calculate glow intensity based on streak
  const baseCorrectGlowIntensity = 0.75;
  const streakBonus = Math.min(streak, 10) * 0.25;
  const correctGlowIntensity = Math.min(baseCorrectGlowIntensity + streakBonus, 1.0);
  const incorrectGlowIntensity = 1.25;

  // Theme-matching pastel colors in RGB format
  const correctGlowColor = "134, 239, 172";
  const incorrectGlowColor = "252, 165, 165";

  return (
    <div 
      className="w-full max-w-sm mx-auto perspective-1000"
      onClick={handleScreenClick}
    >
      <motion.div
        className="relative w-full rounded-xl shadow-lg"
        animate={{
          scale: selectedAnswer ? (isCorrect ? 1.05 : 0.95) : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="w-full rounded-xl bg-[#f5f3ff] p-6 min-h-[16rem] flex items-center justify-center"
          animate={{
            boxShadow: selectedAnswer
              ? isCorrect
                ? `inset 0 0 20px rgba(${correctGlowColor}, ${correctGlowIntensity})`
                : `inset 0 0 20px rgba(${incorrectGlowColor}, ${incorrectGlowIntensity})`
              : streak > 0 && maintainStreak
                ? `inset 0 0 20px rgba(${correctGlowColor}, ${correctGlowIntensity})`
                : "none"
          }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-2xl font-semibold text-gray-800 text-center">{front}</p>
        </motion.div>
        
        <div className="mt-4 grid grid-cols-1 gap-4">
          {answers.map((answer, index) => (
            <Button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                vibrate('button');
                if (!selectedAnswer) {
                  handleAnswer(answer);
                }
              }}
              variant={
                selectedAnswer
                  ? answer === back
                    ? "default"
                    : answer === selectedAnswer
                    ? "destructive"
                    : "secondary"
                  : "secondary"
              }
              className={`w-full text-left py-4 h-auto transition-colors ${
                selectedAnswer && answer === back ? "bg-green-500 hover:bg-green-600" : ""
              }`}
              disabled={!!selectedAnswer}
            >
              {answer}
            </Button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};