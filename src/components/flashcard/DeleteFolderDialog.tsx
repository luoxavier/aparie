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

  const handleDelete = async (e: React.MouseEvent) => {
    try {
      e.stopPropagation();

      // Call onDelete and ensure it handles both playlist and card deletion
      await onDelete();

      // Close the dialog and reset confirmation state
      setIsOpen(false);
      setIsConfirming(false);

      // Optionally, trigger a UI refresh here if not handled in onDelete
      console.log("Deletion successful, UI should refresh now.");
    } catch (error) {
      console.error("Error in handleDelete:", error);

      // Reset confirmation state on error
      setIsConfirming(false);
    }
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirming(true);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirming(false);
    setIsOpen(false);
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
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
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
          <AlertDialogCancel onClick={handleCancel}>
            Cancel
          </AlertDialogCancel>
          {!isConfirming ? (
            <AlertDialogAction 
              onClick={handleContinue}
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