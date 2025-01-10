import { Card, CardContent } from "@/components/ui/card";
import { Flashcard } from "@/types/flashcard";

export interface FolderContentProps {
  flashcards: Flashcard[];
  showCards: boolean;
  showCreator: boolean;
  onDeleteFlashcard: (flashcardId: string) => void;
}

export function FolderContent({ 
  flashcards, 
  showCards, 
  showCreator,
  onDeleteFlashcard 
}: FolderContentProps) {
  if (!showCards) return null;

  return (
    <div className="space-y-3">
      {flashcards.map((flashcard) => (
        <Card key={flashcard.id} className="mt-2">
          <CardContent className="p-4 grid grid-cols-2 gap-4">
            {showCreator && (
              <p className="col-span-2 text-xs text-muted-foreground mb-2">
                <strong>From:</strong> {flashcard.creator.display_name}
              </p>
            )}
            <p className="text-sm md:text-base">{flashcard.front}</p>
            <p className="text-sm md:text-base">{flashcard.back}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}