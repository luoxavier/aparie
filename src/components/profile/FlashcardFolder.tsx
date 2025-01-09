import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";

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

interface FlashcardFolderProps {
  title: string;
  flashcards: Flashcard[];
  onStudy: (cards: Flashcard[]) => void;
  showCreator?: boolean;
}

export function FlashcardFolder({ title, flashcards, onStudy, showCreator = false }: FlashcardFolderProps) {
  const navigate = useNavigate();

  const handleStudy = () => {
    onStudy(flashcards);
    navigate('/study-folder', { state: { flashcards, folderName: title } });
  };

  return (
    <AccordionItem value={title.toLowerCase().replace(/\s+/g, '-')}>
      <AccordionTrigger className="text-left">
        <div className="flex items-center space-x-2">
          <span className="font-medium">
            {title}
            <span className="text-sm text-muted-foreground ml-2">
              ({flashcards.length} cards)
            </span>
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-4">
          <Button 
            onClick={handleStudy}
            className="w-full"
            disabled={flashcards.length === 0}
          >
            Study These Cards
          </Button>
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
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}