import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface FlashcardProps {
  flashcard: Flashcard;
  onAnswer: (answer: string) => void;
}

const FlashcardComponent = ({ flashcard, onAnswer }: FlashcardProps) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    onAnswer(answer);
    setShowAnswer(true);
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
};

const updatePoints = async (userId: string, points: number) => {
  const { error: streakError } = await supabase
    .from('user_streaks')
    .update({
      total_points: points,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (streakError) {
    console.error('Error updating streak:', streakError);
    throw streakError;
  }

  const { error: leaderboardError } = await supabase
    .from('playlist_leaderboards')
    .upsert({
      user_id: userId,
      points: points,
      updated_at: new Date().toISOString()
    });

  if (leaderboardError) {
    console.error('Error updating leaderboard:', leaderboardError);
    throw leaderboardError;
  }
};

export { FlashcardComponent, updatePoints };
