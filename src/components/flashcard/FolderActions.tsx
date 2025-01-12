import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FolderActionsProps {
  isFavorited?: boolean;
  onFavoriteClick: (e: React.MouseEvent) => void;
  onStudyClick: (e: React.MouseEvent) => void;
  onEditClick: (e: React.MouseEvent) => void;
  onExpandClick: (e: React.MouseEvent) => void;
  creatorId?: string;
  playlistName?: string;
  isExpanded?: boolean;
}

export function FolderActions({
  onStudyClick,
  onEditClick,
  onExpandClick,
  creatorId,
  playlistName,
  isExpanded
}: FolderActionsProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const { toast } = useToast();

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditClick(e);
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExpandClick(e);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!creatorId || !playlistName) return;

    try {
      const { error } = await supabase
        .from("flashcards")
        .delete()
        .eq("creator_id", creatorId)
        .eq("playlist_name", playlistName);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Playlist deleted successfully",
      });

      setIsConfirming(false);
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast({
        title: "Error",
        description: "Failed to delete playlist",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleExpandClick}
        className="h-8"
        aria-label={isExpanded ? "Collapse playlist" : "Expand playlist"}
      >
        <Eye className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'opacity-50' : ''}`} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleEditClick}
        className="h-8"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsConfirming(true);
          }}
          className="h-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              playlist and all its flashcards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}