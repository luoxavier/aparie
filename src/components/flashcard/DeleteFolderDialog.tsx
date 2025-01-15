import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteFolderDialogProps {
  onDelete: () => Promise<void>;
}

export function DeleteFolderDialog({ onDelete }: DeleteFolderDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await onDelete();
      setIsOpen(false);
      setIsConfirming(false);
    } catch (error) {
      console.error("Error in handleDelete:", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsConfirming(false);
          }}
          className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {!isConfirming ? "Delete Playlist" : "Final Confirmation"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {!isConfirming 
              ? "This will permanently delete this playlist and all its flashcards. This action cannot be undone."
              : "Please confirm one more time that you want to delete this playlist and all its contents permanently."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsConfirming(false)}>
            Cancel
          </AlertDialogCancel>
          {!isConfirming ? (
            <AlertDialogAction 
              onClick={() => setIsConfirming(true)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Continue
            </AlertDialogAction>
          ) : (
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}