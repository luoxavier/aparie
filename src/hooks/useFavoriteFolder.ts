import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export function useFavoriteFolder(userId?: string, creatorId?: string, playlistName?: string) {
  const [isFavorited, setIsFavorited] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const checkFavoriteStatus = async (retryCount = 0) => {
    if (!userId || !creatorId || !playlistName) return;

    try {
      // Verify user session is valid
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error("Session error:", sessionError);
        return;
      }

      const { data, error } = await supabase
        .from('favorite_folders')
        .select('*')
        .eq('user_id', userId)
        .eq('creator_id', creatorId)
        .eq('playlist_name', playlistName)
        .maybeSingle();

      if (error) {
        console.error('Error checking favorite status:', error);
        
        // Implement exponential backoff for retries
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000;
          setTimeout(() => checkFavoriteStatus(retryCount + 1), delay);
        }
        return;
      }

      setIsFavorited(!!data);
    } catch (error) {
      console.error('Error in checkFavoriteStatus:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      checkFavoriteStatus();
    }
  }, [userId, creatorId, playlistName, user?.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || !creatorId || !playlistName) return;

    try {
      // Verify user session is valid
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        toast({
          title: "Authentication Error",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
        return;
      }

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
          title: "Success",
          description: "Playlist removed from favorites",
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
          title: "Success",
          description: "Playlist added to favorites",
        });
      }
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['favorite-folders'] });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { isFavorited, toggleFavorite };
}