import { Button } from "@/components/ui/button";
import { Edit, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { DeleteFolderDialog } from "./DeleteFolderDialog";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
    if (!creatorId || !playlistName || !user?.id) return;

    try {
      // Delete all flashcards in this playlist (both as creator and recipient)
      const { error: deleteFlashcardsError } = await supabase
        .from("flashcards")
        .delete()
        .or(`and(creator_id.eq.${creatorId},playlist_name.eq.${playlistName}),and(recipient_id.eq.${user.id},playlist_name.eq.${playlistName})`);

      if (deleteFlashcardsError) throw deleteFlashcardsError;

      // Get users who have this folder in their favorites
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorite_folders')
        .select('user_id')
        .eq('creator_id', creatorId)
        .eq('playlist_name', playlistName);

      if (favoritesError) throw favoritesError;

      // Delete favorites
      const { error: deleteFavoritesError } = await supabase
        .from("favorite_folders")
        .delete()
        .eq('creator_id', creatorId)
        .eq('playlist_name', playlistName);

      if (deleteFavoritesError) throw deleteFavoritesError;

      // Send notifications to affected users
      if (favoritesData && favoritesData.length > 0) {
        const notifications = favoritesData.map(({ user_id }) => ({
          recipient_id: user_id,
          sender_id: user.id,
          type: 'folder_deleted',
          content: {
            message: `The playlist "${playlistName}" has been deleted by the owner.`,
            playlistName: playlistName
          }
        }));

        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (notificationError) throw notificationError;
      }

      // Force refresh all relevant queries
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
      throw error;
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