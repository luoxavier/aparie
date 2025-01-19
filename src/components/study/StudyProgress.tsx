interface StudyProgressProps {
  currentIndex: number;
  totalCards: number;
  mode: "normal" | "infinite" | null;
  isReviewMode?: boolean;
}

export function StudyProgress({ 
  currentIndex, 
  totalCards, 
  mode,
  isReviewMode = false
}: StudyProgressProps) {
  return (
    <div className="text-center text-gray-600 text-sm mt-4 mb-8">
      {isReviewMode ? (
        <div className="space-y-1">
          <p className="text-primary font-medium">Review Mode</p>
          <p>{currentIndex + 1}/{totalCards}</p>
        </div>
      ) : (
        <p>{currentIndex + 1}/{totalCards}</p>
      )}
    </div>
  );
}