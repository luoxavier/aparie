interface StudyProgressProps {
  currentIndex: number;
  totalCards: number;
  mode: "normal" | "infinite" | null;
  infiniteCycles?: number;
  perfectCycles?: number;
}

export function StudyProgress({ 
  currentIndex, 
  totalCards, 
  mode, 
  perfectCycles = 0 
}: StudyProgressProps) {
  if (mode === "infinite" && perfectCycles === 3) {
    return (
      <div className="text-center text-gray-600 text-sm mt-4 mb-8">
        🎉 Congratulations! You've mastered these cards!
      </div>
    );
  }

  return (
    <div className="text-center text-gray-600 text-sm mt-4 mb-8">
      {currentIndex + 1}/{totalCards}
    </div>
  );
}