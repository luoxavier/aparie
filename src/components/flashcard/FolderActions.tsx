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

  const handleDelete = async (e: React.MouseEvent) => {
    if (!creatorId || !playlistName || !user?.id) return;

    try {
      // Get all users who have this folder in their favorites or as recipients
      const { data: favoritesData } = await supabase
        .from('favorite_folders')
        .select('user_id')
        .eq('creator_id', creatorId)
        .eq('playlist_name', playlistName);

      const { data: recipientsData } = await supabase
        .from('flashcards')
        .select('recipient_id')
        .eq('creator_id', creatorId)
        .eq('playlist_name', playlistName)
        .not('recipient_id', 'is', null);

      // Combine unique user IDs
      const affectedUsers = new Set([
        ...(favoritesData?.map(f => f.user_id) || []),
        ...(recipientsData?.map(r => r.recipient_id).filter(Boolean) || [])
      ]);

      // Delete flashcards
      const deleteFlashcardsResult = await supabase
        .from("flashcards")
        .delete()
        .eq('creator_id', creatorId)
        .eq('playlist_name', playlistName);

      if (deleteFlashcardsResult.error) throw deleteFlashcardsResult.error;

      // Delete favorites
      const deleteFavoritesResult = await supabase
        .from("favorite_folders")
        .delete()
        .eq('creator_id', creatorId)
        .eq('playlist_name', playlistName);

      if (deleteFavoritesResult.error) throw deleteFavoritesResult.error;

      // Send notifications to affected users
      const notifications = Array.from(affectedUsers).map(userId => ({
        recipient_id: userId,
        sender_id: user.id,
        type: 'folder_deleted',
        content: {
          message: `The playlist "${playlistName}" has been deleted by the owner.`,
          playlistName: playlistName
        }
      }));

      if (notifications.length > 0) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (notificationError) throw notificationError;
      }

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