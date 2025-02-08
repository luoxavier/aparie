
import { useState } from "react";
import { vibrate } from "@/utils/sound";

interface Flashcard {
  id?: string;
  front: string;
  back: string;
  creator_id?: string;
  creator?: {
    display_name: string;
    username: string | null;
  };
}

export function useFlashcardState(existingCards?: Flashcard[]) {
  const [cards, setCards] = useState<Flashcard[]>(
    existingCards?.map(card => ({
      id: card.id,
      front: card.front,
      back: card.back
    })) || [{ front: "", back: "" }]
  );

  const addCard = () => {
    vibrate('button');
    setCards([...cards, { front: "", back: "" }]);
  };

  const updateCard = (index: number, field: "front" | "back", value: string) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  const removeCard = (index: number) => {
    vibrate('button');
    const newCards = cards.filter((_, i) => i !== index);
    setCards(newCards);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, index: number, field: "front" | "back") => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (field === "front") {
        document.getElementById(`back-${index}`)?.focus();
      } else if (index === cards.length - 1) {
        addCard();
        setTimeout(() => document.getElementById(`front-${index + 1}`)?.focus(), 0);
      } else {
        document.getElementById(`front-${index + 1}`)?.focus();
      }
    }
  };

  return {
    cards,
    addCard,
    updateCard,
    removeCard,
    handleKeyPress
  };
}
