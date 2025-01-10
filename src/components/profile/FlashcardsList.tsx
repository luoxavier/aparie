import { useState } from "react";
import { Flashcard, GroupedFlashcards } from "@/types/flashcard";
import FlashcardFolder from "./FlashcardFolder";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateCard from "@/components/CreateCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface FlashcardsListProps {
  flashcards: Flashcard[];
  onFlashcardsChange: (flashcards: Flashcard[]) => void;
}

export default function FlashcardsList({ flashcards, onFlashcardsChange }: FlashcardsListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();

  const groupFlashcardsByCreatorAndFolder = (flashcards: Flashcard[]): GroupedFlashcards => {
    const groupedFlashcards: GroupedFlashcards = {};

    flashcards.forEach((flashcard) => {
      const creatorId = flashcard.creator_id;
      const folderName = flashcard.folder_name || "Uncategorized";

      // Initialize creator group if it doesn't exist
      if (!groupedFlashcards[creatorId]) {
        groupedFlashcards[creatorId] = {
          creator: flashcard.creator,
          folders: {}
        };
      }

      // Initialize folder if it doesn't exist
      if (!groupedFlashcards[creatorId].folders[folderName]) {
        groupedFlashcards[creatorId].folders[folderName] = [];
      }

      // Add flashcard to appropriate folder
      groupedFlashcards[creatorId].folders[folderName].push(flashcard);
    });

    return groupedFlashcards;
  };

  const handleSaveNewCard = async (newCard: Flashcard) => {
    onFlashcardsChange([...flashcards, newCard]);
    setIsCreateModalOpen(false);
    toast({
      title: "Success",
      description: "Flashcard created successfully!",
    });
  };

  const groupedFlashcards = groupFlashcardsByCreatorAndFolder(flashcards);

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Flashcard
        </Button>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <CreateCard onSave={handleSaveNewCard} />
        </DialogContent>
      </Dialog>

      {Object.entries(groupedFlashcards).map(([creatorId, { creator, folders }]) => (
        <div key={creatorId} className="space-y-4">
          <h2 className="text-2xl font-bold">
            {creator.display_name}'s Flashcards
          </h2>
          {Object.entries(folders).map(([folderName, folderFlashcards]) => (
            <FlashcardFolder
              key={`${creatorId}-${folderName}`}
              folderName={folderName}
              flashcards={folderFlashcards}
              onFlashcardsChange={onFlashcardsChange}
            />
          ))}
        </div>
      ))}
    </div>
  );
}