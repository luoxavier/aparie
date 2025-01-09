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
  infiniteCycles = 0, 
  perfectCycles = 0 
}: StudyProgressProps) {
  return (
    <div className="text-center text-gray-600 text-sm mt-2 mb-4">
      {currentIndex + 1}/{totalCards}
      {mode === "infinite" && (
        <div>Cycle {infiniteCycles + 1} - Perfect Cycles: {perfectCycles}/3</div>
      )}
    </div>
  );
}