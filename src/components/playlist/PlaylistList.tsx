import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PlaylistItem } from "./PlaylistItem";
import { Skeleton } from "@/components/ui/skeleton";

export function PlaylistList() {
  const { user } = useAuth();

  const { data: playlists, isLoading } = useQuery({
    queryKey: ['playlists', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcards')
        .select(`
          id,
          playlist_name,
          description,
          is_public,
          created_at,
          creator:profiles!creator_id(display_name),
          last_modified_by:profiles!last_modified_by(display_name),
          last_modified_at,
          modification_history
        `)
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {playlists?.map((playlist) => (
        <PlaylistItem key={playlist.id} playlist={playlist} />
      ))}
    </div>
  );
}