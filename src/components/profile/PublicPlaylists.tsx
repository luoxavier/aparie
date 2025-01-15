import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { FlashcardFolder } from "./FlashcardFolder";
import { Search } from "lucide-react";

export function PublicPlaylists() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: publicPlaylists = [], isLoading } = useQuery({
    queryKey: ['public-playlists', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('flashcards')
        .select(`
          id,
          front,
          back,
          creator_id,
          playlist_name,
          creator:profiles!flashcards_creator_id_fkey (
            display_name,
            username
          )
        `)
        .eq('is_public', true);

      if (searchTerm) {
        query = query.or(`playlist_name.ilike.%${searchTerm}%,creator.display_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group flashcards by playlist_name and creator
      const groupedPlaylists = data.reduce((acc: any, card) => {
        const key = `${card.creator_id}-${card.playlist_name}`;
        if (!acc[key]) {
          acc[key] = {
            creatorId: card.creator_id,
            playlistName: card.playlist_name,
            creator: card.creator,
            flashcards: []
          };
        }
        acc[key].flashcards.push(card);
        return acc;
      }, {});

      return Object.values(groupedPlaylists);
    },
  });

  if (isLoading) return <div>Loading public playlists...</div>;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by playlist name or creator..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="space-y-4">
        {publicPlaylists.map((playlist: any) => (
          <FlashcardFolder
            key={`${playlist.creatorId}-${playlist.playlistName}`}
            title={playlist.playlistName}
            subtitle={`Created by ${playlist.creator.display_name}`}
            flashcards={playlist.flashcards}
            showCreator={true}
            creatorId={playlist.creatorId}
            playlistName={playlist.playlistName}
          />
        ))}
      </div>
    </div>
  );
}