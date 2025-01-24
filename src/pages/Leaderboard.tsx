import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReturnHomeButton } from "@/components/ReturnHomeButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";

export default function Leaderboard() {
  const { creatorId, playlistName } = useParams();

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['leaderboard', creatorId, playlistName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('playlist_leaderboards')
        .select(`
          points,
          user:profiles!playlist_leaderboards_user_id_fkey (
            display_name,
            avatar_url,
            username
          )
        `)
        .eq('creator_id', creatorId)
        .eq('playlist_name', playlistName)
        .order('points', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: playlist } = useQuery({
    queryKey: ['playlist-info', creatorId, playlistName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcards')
        .select('playlist_name, creator:profiles!flashcards_creator_id_fkey (display_name)')
        .eq('creator_id', creatorId)
        .eq('playlist_name', playlistName)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4 mx-auto" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-2xl font-bold text-center mb-8">
        {playlist?.playlist_name} Leaderboard
        <div className="text-sm text-muted-foreground mt-1">
          Created by {playlist?.creator?.display_name}
        </div>
      </h1>

      <div className="space-y-4">
        {leaderboard.map((entry: any, index: number) => (
          <div
            key={entry.user.id}
            className="flex items-center justify-between p-4 bg-card rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 text-center font-medium">
                {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                {index === 1 && <Trophy className="h-5 w-5 text-gray-400" />}
                {index === 2 && <Trophy className="h-5 w-5 text-amber-600" />}
                {index > 2 && `#${index + 1}`}
              </div>
              <Avatar>
                <AvatarImage src={entry.user.avatar_url} />
                <AvatarFallback>
                  {entry.user.display_name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{entry.user.display_name}</div>
                {entry.user.username && (
                  <div className="text-sm text-muted-foreground">
                    @{entry.user.username}
                  </div>
                )}
              </div>
            </div>
            <div className="font-semibold">{entry.points} pts</div>
          </div>
        ))}

        {leaderboard.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No scores recorded yet. Be the first to complete this playlist!
          </div>
        )}
      </div>

      <ReturnHomeButton />
    </div>
  );
}