interface StudyProgressProps {
  currentIndex: number;
  totalCards: number;
  mode: "normal" | "infinite" | "mastery" | null;
  isReviewMode?: boolean;
  infiniteCycles?: number;
  perfectCycles?: number;
}

export function StudyProgress({ 
  currentIndex, 
  totalCards, 
  mode,
  isReviewMode = false,
  infiniteCycles = 0,
  perfectCycles = 0
}: StudyProgressProps) {
  return (
    <div className="text-center text-gray-600 text-sm mt-4 mb-8">
      {isReviewMode ? (
        <div className="space-y-1">
          <p className="text-primary font-medium">Review Mode</p>
          <p>{currentIndex + 1}/{totalCards}</p>
        </div>
      ) : mode === "infinite" ? (
        <div className="space-y-1">
          <p className="text-primary font-medium">Infinite Mode</p>
          <p>Cycle {infiniteCycles + 1} - Perfect Cycles: {perfectCycles}</p>
          <p>{currentIndex + 1}/{totalCards}</p>
        </div>
      ) : mode === "mastery" ? (
        <div className="space-y-1">
          <p className="text-primary font-medium">Mastery Mode</p>
          <p>Perfect Cycles: {perfectCycles}/3</p>
          <p>{currentIndex + 1}/{totalCards}</p>
        </div>
      ) : (
        <p>{currentIndex + 1}/{totalCards}</p>
      )}
    </div>
  );
}