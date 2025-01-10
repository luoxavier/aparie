import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateMultipleCards } from "@/components/CreateMultipleCards";
import { useToast } from "@/hooks/use-toast";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  creator_id: string;
}

interface FolderModifyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  flashcards: Flashcard[];
  userId?: string;
  folderName?: string;
}

export function FolderModifyDialog({
  isOpen,
  onClose,
  flashcards,
  userId,
  folderName
}: FolderModifyDialogProps) {
  const { toast } = useToast();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Modify Flashcards</DialogTitle>
        </DialogHeader>
        <CreateMultipleCards 
          recipientId={userId}
          existingCards={flashcards}
          folderName={folderName}
          onSave={() => {
            toast({
              title: "Success",
              description: "Flashcards updated successfully",
            });
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}