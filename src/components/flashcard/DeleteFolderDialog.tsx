import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteFolderDialogProps {
  onDelete: (e: React.MouseEvent) => void;
}

export function DeleteFolderDialog({ onDelete }: DeleteFolderDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(e);
    setIsOpen(false);
    setIsConfirming(false);
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
          className="h-8 text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {!isConfirming ? (
              "This will permanently delete this playlist and all its flashcards. This action cannot be undone."
            ) : (
              "Please confirm one more time that you want to delete this playlist and all its contents permanently."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsConfirming(false)}>
            Cancel
          </AlertDialogCancel>
          {!isConfirming ? (
            <AlertDialogAction onClick={() => setIsConfirming(true)}>
              Continue
            </AlertDialogAction>
          ) : (
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-700"
            >
              Delete Permanently
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}