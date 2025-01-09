import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface StudyControlsProps {
  onExit: () => void;
  onReviewMistakes: () => void;
  mistakesCount: number;
  isReviewingMistakes: boolean;
}

export function StudyControls({ 
  onExit, 
  onReviewMistakes, 
  mistakesCount, 
  isReviewingMistakes 
}: StudyControlsProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-4 left-0 right-0 px-4 space-y-2 max-w-md mx-auto">
      <Button
        variant="secondary"
        onClick={onReviewMistakes}
        className="w-full bg-secondary hover:bg-secondary/90"
        disabled={mistakesCount === 0 || isReviewingMistakes}
      >
        Review Mistakes
      </Button>
      <Button
        variant="outline"
        onClick={onExit}
        className="w-full"
      >
        Return Home
      </Button>
    </div>
  );
}