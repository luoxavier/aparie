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

  const checkFavoriteStatus = async () => {
    if (!userId || !creatorId || !playlistName) return;

    try {
      // First verify the session is valid
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        return;
      }

      if (!session) {
        console.log('No active session');
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
        if (error.code === 'PGRST116') {
          // Handle case where the record doesn't exist
          setIsFavorited(false);
        } else {
          console.error('Error checking favorite status:', error);
          toast({
            title: "Error",
            description: "Failed to check favorite status. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      setIsFavorited(!!data);
    } catch (error) {
      console.error('Error in checkFavoriteStatus:', error);
      toast({
        title: "Error",
        description: "Failed to check favorite status. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user?.id) {
      checkFavoriteStatus();
    }

    return () => {
      // Cleanup function
      setIsFavorited(false);
    };
  }, [userId, creatorId, playlistName, user?.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || !creatorId || !playlistName) return;

    try {
      // Verify session is valid before proceeding
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
        // First check if the favorite already exists
        const { data: existingFavorite } = await supabase
          .from('favorite_folders')
          .select('*')
          .eq('user_id', userId)
          .eq('creator_id', creatorId)
          .eq('playlist_name', playlistName)
          .maybeSingle();

        if (!existingFavorite) {
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
        } else {
          // If it already exists, just update the UI state
          setIsFavorited(true);
        }
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