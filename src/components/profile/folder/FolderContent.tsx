import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

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
  return (
    <AnimatePresence>
      {showCards && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-3 overflow-hidden"
        >
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}