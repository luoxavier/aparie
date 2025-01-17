import { useState } from "react";
import { Flashcard } from "@/components/Flashcard";

interface StudySessionProps {
  currentCard: FlashcardType;
  deck: FlashcardType[];
  onResult: (correct: boolean) => void;
  onNext: () => void;
  streak: number;
}

interface FlashcardType {
  id: string;
  front: string;
  back: string;
  creator_id: string;
  playlist_name?: string;
}

export function StudySession({ 
  currentCard, 
  deck, 
  onResult, 
  onNext,
  streak 
}: StudySessionProps) {
  const getOtherAnswers = (currentCard: FlashcardType) => {
    return deck
      .filter(card => card.id !== currentCard.id)
      .map(card => card.back);
  };

  return (
    <>
      {streak > 0 && (
        <div className="text-center mb-4">
          <span className="inline-block bg-primary text-white px-4 py-2 rounded-full">
            🔥 Streak: {streak}
          </span>
        </div>
      )}

      <Flashcard
        flashcard={currentCard}
        onAnswer={(answer) => {
          onResult(answer === currentCard.back);
          onNext();
        }}
      />
    </>
  );
}