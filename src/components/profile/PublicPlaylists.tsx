
import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { FlashcardFolder } from "./FlashcardFolder";
import { Search } from "lucide-react";
import debounce from "lodash/debounce";

export function PublicPlaylists() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  // Create a debounced function that updates the search term
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedTerm(value);
      }, 300),
    []
  );

  // Handle input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value); // Update the input value immediately
      debouncedSearch(value); // Debounce the actual search
    },
    [debouncedSearch]
  );

  const { data: publicPlaylists = [], isLoading } = useQuery({
    queryKey: ['public-playlists', debouncedTerm],
    queryFn: async () => {
      let query = supabase
        .from('flashcards')
        .select(`
          id,
          front,
          back,
          creator_id,
          playlist_name,
          is_public,
          creator:profiles!flashcards_creator_id_fkey (
            display_name,
            username
          )
        `)
        .eq('is_public', true);

      if (debouncedTerm) {
        // Fix: Split the OR conditions into separate calls
        query = query.or(
          `playlist_name.ilike.%${debouncedTerm}%,creator.display_name.ilike.%${debouncedTerm}%`
        );
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching public playlists:", error);
        throw error;
      }

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
        acc[key].flashcards.push({
          ...card,
          is_public: true
        });
        return acc;
      }, {});

      return Object.values(groupedPlaylists);
    },
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by playlist name or creator..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-8"
        />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center">Loading public playlists...</div>
        ) : publicPlaylists.length === 0 ? (
          <div className="text-center text-muted-foreground">
            {debouncedTerm ? "No playlists found" : "No public playlists available"}
          </div>
        ) : (
          publicPlaylists.map((playlist: any) => (
            <FlashcardFolder
              key={`${playlist.creatorId}-${playlist.playlistName}`}
              title={playlist.playlistName}
              subtitle={`Created by ${playlist.creator.display_name}`}
              flashcards={playlist.flashcards}
              showCreator={true}
              creatorId={playlist.creatorId}
              playlistName={playlist.playlistName}
            />
          ))
        )}
      </div>
    </div>
  );
}
