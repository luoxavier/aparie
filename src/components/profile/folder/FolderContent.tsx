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
}

interface FolderContentProps {
  flashcards: Flashcard[];
  showCards: boolean;
  showCreator: boolean;
}

export function FolderContent({ flashcards, showCards, showCreator }: FolderContentProps) {
  if (!showCards) return null;

  return (
    <>
      {flashcards.map((flashcard) => (
        <Card key={flashcard.id}>
          <CardContent className="p-4 grid grid-cols-2 gap-4">
            {showCreator && (
              <p className="col-span-2"><strong>From:</strong> {flashcard.creator.display_name}</p>
            )}
            <p>{flashcard.front}</p>
            <p>{flashcard.back}</p>
          </CardContent>
        </Card>
      ))}
    </>
  );
}