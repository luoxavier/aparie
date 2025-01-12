import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateMultipleCards } from "@/components/CreateMultipleCards";
import { Separator } from "@/components/ui/separator";

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

interface ModifyFolderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  flashcards: Flashcard[];
  playlistName?: string;
  onSave: () => void;
}

export function ModifyFolderDialog({
  isOpen,
  onOpenChange,
  userId,
  flashcards,
  playlistName,
  onSave,
}: ModifyFolderDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Modify Flashcards</DialogTitle>
        </DialogHeader>
        <CreateMultipleCards 
          recipientId={userId}
          existingCards={flashcards}
          playlistName={playlistName}
          onSave={onSave}
          isModifying={true}
          hideRecipientSelect={true}
        />
      </DialogContent>
    </Dialog>
  );
}