import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
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
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface FolderActionsProps {
  isFavorited: boolean;
  onFavoriteClick: (e: React.MouseEvent) => void;
  onStudyClick: (e: React.MouseEvent) => void;
  onEditClick: (e: React.MouseEvent) => void;
  creatorId?: string;
  playlistName?: string;
}

export function FolderActions({ 
  onStudyClick, 
  onEditClick,
  creatorId,
  playlistName 
}: FolderActionsProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditClick(e);
  };

  const handleStudyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStudyClick(e);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!creatorId || !playlistName) return;

    try {
      // Delete all flashcards in the playlist
      const deleteFlashcardsResult = await supabase
        .from("flashcards")
        .delete()
        .eq('creator_id', creatorId)
        .eq('playlist_name', playlistName);

      if (deleteFlashcardsResult.error) throw deleteFlashcardsResult.error;

      // Delete playlist from favorites
      const deleteFavoritesResult = await supabase
        .from("favorite_folders")
        .delete()
        .eq('creator_id', creatorId)
        .eq('playlist_name', playlistName);

      if (deleteFavoritesResult.error) throw deleteFavoritesResult.error;

      // Invalidate queries to refresh both tabs
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-folders'] });

      toast({
        title: "Success",
        description: "Playlist deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete playlist. Please try again.",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="default"
        size="sm"
        onClick={handleStudyClick}
        className="h-8"
      >
        Study
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleEditClick}
        className="h-8"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <AlertDialog>
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
    </div>
  );
}