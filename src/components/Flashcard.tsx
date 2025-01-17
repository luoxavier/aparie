import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  creator_id: string;
  playlist_name?: string;
}

interface FlashcardProps {
  flashcard: Flashcard;
  onAnswer: (answer: string) => void;
}

export function Flashcard({ flashcard, onAnswer }: FlashcardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    onAnswer(answer);
    setShowAnswer(true);

    if (answer === flashcard.back) {
      try {
        const { data: userData } = await supabase
          .from('user_streaks')
          .select('total_points')
          .single();

        const newPoints = (userData?.total_points || 0) + 10;

        // Update user_streaks
        await supabase
          .from('user_streaks')
          .update({
            total_points: newPoints,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', flashcard.creator_id);

        // Update playlist_leaderboards if there's a playlist
        if (flashcard.playlist_name) {
          await supabase
            .from('playlist_leaderboards')
            .upsert({
              user_id: flashcard.creator_id,
              creator_id: flashcard.creator_id,
              playlist_name: flashcard.playlist_name,
              points: newPoints,
              updated_at: new Date().toISOString()
            });
        }
      } catch (error) {
        console.error('Error updating points:', error);
      }
    }
  };

  return (
    <div className="flashcard">
      <div className="front">
        <p>{flashcard.front}</p>
        <button onClick={() => handleAnswer(flashcard.back)}>Show Answer</button>
      </div>
      {showAnswer && (
        <div className="back">
          <p>{flashcard.back}</p>
        </div>
      )}
    </div>
  );
}