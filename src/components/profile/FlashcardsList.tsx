import { useState } from "react";
import { Flashcard, GroupedFlashcards } from "@/types/flashcard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateCard } from "@/components/CreateCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import FlashcardFolder from "./FlashcardFolder";
import { useAuth } from "@/contexts/AuthContext";

interface FlashcardsListProps {
  flashcards: Flashcard[];
  onFlashcardsChange: (flashcards: Flashcard[]) => void;
}

export function FlashcardsList({ flashcards, onFlashcardsChange }: FlashcardsListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const groupFlashcardsByCreatorAndFolder = (flashcards: Flashcard[]): GroupedFlashcards => {
    const groupedFlashcards: GroupedFlashcards = {};

    flashcards.forEach((flashcard) => {
      const creatorId = flashcard.creator_id;
      const folderName = flashcard.folder_name || "Uncategorized";

      if (!groupedFlashcards[creatorId]) {
        groupedFlashcards[creatorId] = {
          creator: flashcard.creator,
          folders: {}
        };
      }

      if (!groupedFlashcards[creatorId].folders[folderName]) {
        groupedFlashcards[creatorId].folders[folderName] = [];
      }

      groupedFlashcards[creatorId].folders[folderName].push(flashcard);
    });

    return groupedFlashcards;
  };

  const handleSaveNewCard = async (front: string, back: string) => {
    if (!user) return;

    const newCard: Flashcard = {
      id: crypto.randomUUID(),
      front,
      back,
      creator_id: user.id,
      recipient_id: null,
      folder_name: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator: {
        id: user.id,
        username: null,
        display_name: user.email || 'Anonymous',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    };

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
              isMyFlashcards={user?.id === creatorId}
              isFromFriend={user?.id !== creatorId}
              showCreator={false}
            />
          ))}
        </div>
      ))}
    </div>
  );
}