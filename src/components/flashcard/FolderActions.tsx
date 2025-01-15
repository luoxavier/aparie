import { Button } from "@/components/ui/button";
import { Edit, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DeleteFolderDialog } from "./DeleteFolderDialog";
import { usePlaylistDeletion } from "@/hooks/usePlaylistDeletion";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface FolderActionsProps {
  isFavorited: boolean;
  onFavoriteClick: (e: React.MouseEvent) => void;
  onStudyClick: (e: React.MouseEvent) => void;
  onEditClick: (e: React.MouseEvent) => void;
  onExpandClick: (e: React.MouseEvent) => void;
  creatorId?: string;
  playlistName?: string;
  isExpanded?: boolean;
  recipientCanModify?: boolean;
}

export function FolderActions({ 
  onStudyClick, 
  onEditClick,
  onExpandClick,
  creatorId,
  playlistName,
  recipientCanModify = false
}: FolderActionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { deletePlaylist } = usePlaylistDeletion();

  const canModify = user?.id === creatorId || recipientCanModify;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditClick(e);
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExpandClick(e);
  };

  const handleDelete = async () => {
    if (!creatorId || !playlistName || !user?.id) {
      console.error("Missing required data for deletion");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete playlist. Missing required data.",
      });
      return;
    }

    try {
      await deletePlaylist(creatorId, playlistName, user.id);
      
      // Invalidate both queries to ensure UI updates
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['flashcards'] }),
        queryClient.invalidateQueries({ queryKey: ['favorite-folders'] })
      ]);

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
        variant="ghost"
        size="sm"
        onClick={handleExpandClick}
        className="h-8"
      >
        <Eye className="h-4 w-4" />
      </Button>
      {canModify && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEditClick}
          className="h-8"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {user?.id === creatorId && (
        <DeleteFolderDialog onDelete={handleDelete} />
      )}
    </div>
  );
}