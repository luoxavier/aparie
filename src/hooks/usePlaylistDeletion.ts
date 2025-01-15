import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function usePlaylistDeletion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteFlashcards = async (playlistName: string) => {
    console.log('Deleting flashcards for playlist:', playlistName);
    const { error } = await supabase
      .from("flashcards")
      .delete()
      .eq('playlist_name', playlistName);

    if (error) {
      console.error('Error deleting flashcards:', error);
      throw error;
    }
  };

  const getFavoriteUsers = async (creatorId: string, playlistName: string) => {
    const { data, error } = await supabase
      .from('favorite_folders')
      .select('user_id')
      .eq('creator_id', creatorId)
      .eq('playlist_name', playlistName);

    if (error) throw error;
    return data;
  };

  const deleteFavorites = async (creatorId: string, playlistName: string) => {
    const { error } = await supabase
      .from("favorite_folders")
      .delete()
      .eq('creator_id', creatorId)
      .eq('playlist_name', playlistName);

    if (error) throw error;
  };

  const sendNotifications = async (
    favoritesData: { user_id: string }[],
    senderId: string,
    playlistName: string
  ) => {
    if (!favoritesData.length) return;

    const notifications = favoritesData.map(({ user_id }) => ({
      recipient_id: user_id,
      sender_id: senderId,
      type: 'folder_deleted',
      content: {
        message: `The playlist "${playlistName}" has been deleted by the owner.`,
        playlistName: playlistName
      }
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) throw error;
  };

  const deletePlaylist = async (creatorId: string, playlistName: string, userId: string) => {
    try {
      console.log('Starting playlist deletion process...');
      
      // Step 1: Delete all flashcards
      console.log('Step 1: Deleting flashcards...');
      await deleteFlashcards(playlistName);
      console.log('Flashcards deleted successfully');

      // Step 2: Get users who have this folder in favorites
      console.log('Step 2: Getting users with favorites...');
      const favoritesData = await getFavoriteUsers(creatorId, playlistName);
      console.log('Found favorites for users:', favoritesData);

      // Step 3: Delete from favorites
      console.log('Step 3: Deleting favorites...');
      await deleteFavorites(creatorId, playlistName);
      console.log('Favorites deleted successfully');

      // Step 4: Send notifications to affected users
      console.log('Step 4: Sending notifications...');
      await sendNotifications(favoritesData, userId, playlistName);
      console.log('Notifications sent successfully');

      // Step 5: Refresh queries
      console.log('Step 5: Refreshing queries...');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['flashcards'] }),
        queryClient.invalidateQueries({ queryKey: ['favorite-folders'] })
      ]);
      console.log('Queries refreshed successfully');

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

  return { deletePlaylist };
}