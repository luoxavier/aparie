import { Card, CardContent } from "@/components/ui/card";

interface Creator {
  display_name: string;
  username: string | null;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  creator_id: string;
  creator: Creator;
  recipient_can_modify?: boolean;
  is_public?: boolean;
}

interface FolderContentProps {
  flashcards: Flashcard[];
  showCards: boolean;
  showCreator: boolean;
}

export function FolderContent({ flashcards, showCards, showCreator }: FolderContentProps) {
  if (!showCards) return null;

  const isPublicWithMultipleCreators = 
    flashcards.some(card => card.is_public && card.recipient_can_modify);

  return (
    <div className="space-y-3">
      {flashcards.map((flashcard) => (
        <Card key={flashcard.id} className="mt-2">
          <CardContent className="p-4">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center">
              <p className="text-sm md:text-base min-w-0 truncate">{flashcard.front}</p>
              <p className="text-sm md:text-base min-w-0 truncate">{flashcard.back}</p>
              {isPublicWithMultipleCreators && (
                <p className="text-[10px] text-muted-foreground text-right whitespace-nowrap">
                  {flashcard.creator.display_name}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
