
import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FlashcardFolder } from "./FlashcardFolder";
import { Search } from "lucide-react";
import debounce from "lodash/debounce";
import { FriendSearchInput } from "./FriendSearchInput";

export function PublicPlaylists() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  // Create a debounced function that updates the search term with 150ms delay
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedTerm(value);
      }, 150),
    []
  );

  // Handle input change
  const handleSearchChange = useCallback(
    (value: string) => {
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
        query = query.or(
          `playlist_name.ilike.%${debouncedTerm}%,creator.display_name.ilike.%${debouncedTerm}%`
        );
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching public playlists:", error);
        throw error;
      }

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
      <FriendSearchInput
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search by playlist name or creator..."
      />

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
