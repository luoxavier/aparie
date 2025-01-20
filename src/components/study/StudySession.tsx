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
  creator_id?: string;
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
    <Flashcard
      front={currentCard.front}
      back={currentCard.back}
      otherAnswers={getOtherAnswers(currentCard)}
      onResult={onResult}
      onNext={onNext}
      creatorId={currentCard.creator_id}
      playlistName={currentCard.playlist_name}
      streak={streak}
    />
  );
}