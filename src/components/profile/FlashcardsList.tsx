
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FlashcardFolder } from "./FlashcardFolder";
import { EmptyFlashcardsState } from "./EmptyFlashcardsState";
import { FriendSearchInput } from "./FriendSearchInput";
import { useMemo } from "react";
import debounce from "lodash/debounce";

export function FlashcardsList() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  console.log('AuthContext user:', user); // Debug auth state

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

  const { data: flashcards = [], isLoading, error } = useQuery({
    queryKey: ['flashcards', user?.id, debouncedTerm],
    queryFn: async () => {
      console.log('Starting flashcards query for user:', user?.id); // Debug query start
      if (!user) {
        console.log('No user found, returning empty array'); // Debug auth state
        return [];
      }

      let query = supabase
        .from('flashcards')
        .select(`
          id,
          creator_id,
          recipient_id,
          playlist_name,
          front,
          back,
          is_public,
          recipient_can_modify,
          creator:profiles!flashcards_creator_id_fkey (
            display_name,
            username
          )
        `)
        .or(`creator_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('is_public', false);

      if (debouncedTerm) {
        console.log('Applying search term:', debouncedTerm); // Debug search
        query = query.ilike('playlist_name', `%${debouncedTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Supabase query error:', error); // Debug query error
        throw error;
      }

      console.log('Query successful, received data:', data?.length || 0, 'items'); // Debug successful query

      // Group flashcards by playlist_name and creator_id
      const groupedFlashcards = data.reduce((acc: any, card) => {
        const key = `${card.creator_id}-${card.playlist_name}`;
        if (!acc[key]) {
          acc[key] = {
            creatorId: card.creator_id,
            playlistName: card.playlist_name,
            creator: card.creator,
            recipientCanModify: card.recipient_can_modify,
            isRecipient: card.recipient_id === user.id,
            flashcards: []
          };
        }
        acc[key].flashcards.push(card);
        return acc;
      }, {});

      return Object.values(groupedFlashcards);
    },
    enabled: !!user,
    staleTime: 1000 * 60,
    retry: 3,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <FriendSearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by playlist name..."
        />
        <div className="animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg mb-4" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Rendering error state:', error); // Debug render error
    return (
      <div className="space-y-4">
        <FriendSearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by playlist name..."
        />
        <div className="text-center text-red-500">
          Error loading flashcards. Please try again later.
        </div>
      </div>
    );
  }

  if (!flashcards.length && !debouncedTerm) {
    return <EmptyFlashcardsState />;
  }

  return (
    <div className="space-y-4 mt-3">
      <FriendSearchInput
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search by playlist name..."
      />

      <div className="space-y-4">
        {flashcards.length === 0 ? (
          <div className="text-center text-muted-foreground">
            {debouncedTerm ? "No playlists found" : "No playlists available"}
          </div>
        ) : (
          flashcards.map((playlist: any) => (
            <FlashcardFolder
              key={`${playlist.creatorId}-${playlist.playlistName}`}
              title={playlist.playlistName}
              subtitle={`Created by ${playlist.creator.display_name}`}
              flashcards={playlist.flashcards}
              showCreator={true}
              creatorId={playlist.creatorId}
              playlistName={playlist.playlistName}
              recipientCanModify={playlist.recipientCanModify && playlist.isRecipient}
            />
          ))
        )}
      </div>
    </div>
  );
}
