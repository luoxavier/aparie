import { Flashcard } from "@/components/Flashcard";
import { Database } from "@/integrations/supabase/types";

type FlashcardType = Database['public']['Tables']['flashcards']['Row'];

interface SharedWithMeProps {
  flashcards?: FlashcardType[];
}

export default function SharedWithMe({ flashcards = [] }: SharedWithMeProps) {
  return (
    <div>
      {flashcards.map((flashcard) => (
        <Flashcard 
          key={flashcard.id}
          flashcard={flashcard}
          onAnswer={() => {}}
        />
      ))}
    </div>
  );
}