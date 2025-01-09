import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ScoreDisplayProps {
  score: number;
  totalCards: number;
  mistakes: any[];
  isReviewingMistakes: boolean;
  onReviewMistakes: () => void;
}

export function ScoreDisplay({ 
  score, 
  totalCards, 
  mistakes, 
  isReviewingMistakes, 
  onReviewMistakes 
}: ScoreDisplayProps) {
  const navigate = useNavigate();

  return (
    <div className="text-center space-y-6">
      <h2 className="text-3xl font-bold">
        Score: {score}/{totalCards}
      </h2>
      {mistakes.length > 0 && !isReviewingMistakes && (
        <Button 
          onClick={onReviewMistakes}
          className="w-full"
        >
          Review Mistakes ({mistakes.length})
        </Button>
      )}
      {(mistakes.length === 0 || isReviewingMistakes) && (
        <div className="space-y-4">
          <h3 className="text-2xl">🎉 Congratulations!</h3>
          <Button 
            onClick={() => navigate("/profile")}
            className="w-full"
          >
            Back to Main Menu
          </Button>
        </div>
      )}
    </div>
  );
}