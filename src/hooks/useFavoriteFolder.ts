import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function useFavoriteFolder(userId?: string, creatorId?: string, playlistName?: string) {
  const [isFavorited, setIsFavorited] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;
    
    const checkFavoriteStatus = async () => {
      if (!userId || !creatorId || !playlistName) return;

      try {
        const session = await supabase.auth.getSession();
        if (!session.data.session) {
          console.log('No active session found');
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
          if (error.message.includes('JWT')) {
            await supabase.auth.refreshSession();
            // Retry the query after refresh
            const { data: retryData, error: retryError } = await supabase
              .from('favorite_folders')
              .select('*')
              .eq('user_id', userId)
              .eq('creator_id', creatorId)
              .eq('playlist_name', playlistName)
              .maybeSingle();

            if (retryError) throw retryError;
            if (mounted) setIsFavorited(!!retryData);
          } else {
            throw error;
          }
        } else if (mounted) {
          setIsFavorited(!!data);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
        toast({
          title: "Error",
          description: "Could not check favorite status. Please try again.",
          variant: "destructive",
        });
      }
    };

    checkFavoriteStatus();
    return () => {
      mounted = false;
    };
  }, [userId, creatorId, playlistName, toast]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || !creatorId || !playlistName) return;

    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        toast({
          title: "Error",
          description: "Please sign in to manage favorites",
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
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['favorite-folders'] });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "There was an error updating your favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { isFavorited, toggleFavorite };
}