
import { Button } from "@/components/ui/button";
import { Edit, Eye, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DeleteFolderDialog } from "./DeleteFolderDialog";
import { usePlaylistDeletion } from "@/hooks/usePlaylistDeletion";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

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
  isPublic?: boolean;
}

export function FolderActions({ 
  onStudyClick, 
  onEditClick,
  onExpandClick,
  creatorId,
  playlistName,
  recipientCanModify = false,
  isPublic = false
}: FolderActionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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

  const handleLeaderboardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (creatorId && playlistName) {
      navigate(`/leaderboard/${creatorId}/${playlistName}`);
    }
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

  const buttonSize = "xs";
  const buttonClass = "h-7 w-7 p-0";

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size={buttonSize}
        onClick={handleExpandClick}
        className={buttonClass}
        title="View cards"
      >
        <Eye className="h-3.5 w-3.5" />
      </Button>
      {isPublic && (
        <Button
          variant="ghost"
          size={buttonSize}
          onClick={handleLeaderboardClick}
          className={buttonClass}
          title="Leaderboard"
        >
          <Trophy className="h-3.5 w-3.5" />
        </Button>
      )}
      {canModify && (
        <Button
          variant="ghost"
          size={buttonSize}
          onClick={handleEditClick}
          className={buttonClass}
          title="Edit"
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
      )}
      {user?.id === creatorId && (
        <DeleteFolderDialog onDelete={handleDelete} />
      )}
    </div>
  );
}
