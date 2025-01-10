import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { CreateMultipleCards } from "@/components/CreateMultipleCards";
import { useToast } from "@/hooks/use-toast";

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

interface FolderActionsProps {
  isMyFlashcards: boolean;
  isFromFriend: boolean;
  flashcards: Flashcard[];
  userId?: string;
  folderName?: string;
  onStudy: () => void;
}

export function FolderActions({ 
  isMyFlashcards, 
  isFromFriend, 
  flashcards,
  userId,
  folderName,
  onStudy 
}: FolderActionsProps) {
  const { toast } = useToast();
  const [isModifyOpen, setIsModifyOpen] = useState(false);

  return (
    <div className="space-y-4">
      {isMyFlashcards && (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full bg-secondary hover:bg-secondary/90 mb-4">
              Create New Flashcard
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Flashcards</DialogTitle>
              <DialogDescription>
                Add new flashcards to your collection.
              </DialogDescription>
            </DialogHeader>
            <CreateMultipleCards />
          </DialogContent>
        </Dialog>
      )}
      
      <Button 
        onClick={onStudy}
        className="w-full"
        disabled={flashcards.length === 0}
      >
        Study These Cards
      </Button>

      {isFromFriend && (
        <Dialog open={isModifyOpen} onOpenChange={setIsModifyOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-secondary hover:bg-secondary/90">
              Modify Folder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Modify Flashcards</DialogTitle>
              <DialogDescription>
                Update or remove flashcards in this folder.
              </DialogDescription>
            </DialogHeader>
            <CreateMultipleCards 
              recipientId={userId}
              existingCards={flashcards}
              folderName={folderName}
              onSave={() => {
                setIsModifyOpen(false);
                toast({
                  title: "Success",
                  description: "Flashcards updated successfully",
                });
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}