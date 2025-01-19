import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { shuffle } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface FlashcardProps {
  front: string;
  back: string;
  otherAnswers: string[];
  onResult: (correct: boolean) => void;
  onNext: () => void;
  creatorId?: string;
  playlistName?: string;
}

export const Flashcard = ({ 
  front, 
  back, 
  otherAnswers, 
  onResult, 
  onNext,
  creatorId,
  playlistName 
}: FlashcardProps) => {
  const { user } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const uniqueAnswers = otherAnswers.filter(answer => answer !== back);
    const selectedWrongAnswers = uniqueAnswers.slice(0, 3);
    const allAnswers = [back, ...selectedWrongAnswers];
    setAnswers(shuffle(allAnswers));
  }, [back, otherAnswers]);

  const updatePoints = async (points: number) => {
    if (!user?.id || !creatorId || !playlistName) return;

    const { error: streakError } = await supabase
      .from('user_streaks')
      .update({ 
        total_points: points,
        weekly_points: points,
        monthly_points: points
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (streakError) {
      console.error('Error updating streak points:', streakError);
      return;
    }

    const { error: leaderboardError } = await supabase
      .from('playlist_leaderboards')
      .upsert({
        playlist_name: playlistName,
        creator_id: creatorId,
        user_id: user.id,
        points: points,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'playlist_name,creator_id,user_id',
        ignoreDuplicates: false
      });

    if (leaderboardError) {
      console.error('Error updating leaderboard:', leaderboardError);
    }
  };

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === back;
    setIsCorrect(correct);
    
    if (correct) {
      await updatePoints(10);
      toast({
        title: "Correct! 🎉",
        description: "+10 points!",
        variant: "default",
      });
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        onResult(true);
        onNext();
      }, 1000);
    } else {
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

  return (
    <div 
      className="w-full max-w-sm mx-auto perspective-1000"
      onClick={handleScreenClick}
    >
      <motion.div
        className="relative w-full rounded-xl shadow-lg"
        animate={{
          scale: selectedAnswer ? (isCorrect ? 1.05 : 0.95) : 1,
          boxShadow: selectedAnswer
            ? (isCorrect
              ? "0 0 20px rgba(0, 255, 0, 0.3)"
              : "0 0 20px rgba(255, 0, 0, 0.3)")
            : "none"
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-full rounded-xl bg-white p-6 min-h-[16rem] flex items-center justify-center">
          <p className="text-2xl font-semibold text-gray-800 text-center">{front}</p>
        </div>
        
        <div className="mt-4 grid grid-cols-1 gap-4">
          {answers.map((answer, index) => (
            <Button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
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