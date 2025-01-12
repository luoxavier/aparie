import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function useFavoriteFolder(userId?: string, creatorId?: string, playlistName?: string) {
  const [isFavorited, setIsFavorited] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    checkFavoriteStatus();
  }, [userId, creatorId, playlistName]);

  const checkFavoriteStatus = async () => {
    if (!userId || !creatorId || !playlistName) return;

    try {
      const { data, error } = await supabase
        .from('favorite_folders')
        .select('*')
        .eq('user_id', userId)
        .eq('creator_id', creatorId)
        .eq('playlist_name', playlistName)
        .maybeSingle();

      if (error) throw error;
      setIsFavorited(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || !creatorId || !playlistName) return;

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('favorite_folders')
          .delete()
          .eq('user_id', userId)
          .eq('creator_id', creatorId)
          .eq('playlist_name', playlistName);

        if (error) throw error;
        setIsFavorited(false);
        toast({
          title: "Playlist removed from favorites",
          description: "The playlist has been removed from your favorites.",
        });
      } else {
        const { error } = await supabase
          .from('favorite_folders')
          .insert({
            user_id: userId,
            creator_id: creatorId,
            playlist_name: playlistName,
          });

        if (error) throw error;
        setIsFavorited(true);
        toast({
          title: "Playlist added to favorites",
          description: "The playlist has been added to your favorites.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['favorite-folders'] });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "There was an error updating your favorites.",
        variant: "destructive",
      });
    }
  };

  return { isFavorited, toggleFavorite };
}