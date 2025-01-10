import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function useFavoriteFolder(userId?: string, creatorId?: string, folderName?: string) {
  const [isFavorited, setIsFavorited] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    checkFavoriteStatus();
  }, [userId, creatorId, folderName]);

  const checkFavoriteStatus = async () => {
    if (!userId || !creatorId || !folderName) return;

    try {
      const { data, error } = await supabase
        .from('favorite_folders')
        .select('*')
        .eq('user_id', userId)
        .eq('creator_id', creatorId)
        .eq('folder_name', folderName)
        .maybeSingle();

      if (error) throw error;
      setIsFavorited(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || !creatorId || !folderName) return;

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('favorite_folders')
          .delete()
          .eq('user_id', userId)
          .eq('creator_id', creatorId)
          .eq('folder_name', folderName);

        if (error) throw error;
        setIsFavorited(false);
        toast({
          title: "Folder removed from favorites",
          description: "The folder has been removed from your favorites.",
        });
      } else {
        const { error } = await supabase
          .from('favorite_folders')
          .insert({
            user_id: userId,
            creator_id: creatorId,
            folder_name: folderName,
          });

        if (error) throw error;
        setIsFavorited(true);
        toast({
          title: "Folder added to favorites",
          description: "The folder has been added to your favorites.",
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