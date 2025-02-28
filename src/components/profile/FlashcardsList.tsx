import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FlashcardFolder } from "./FlashcardFolder";
import { EmptyFlashcardsState } from "./EmptyFlashcardsState";
import { FriendSearchInput } from "./FriendSearchInput";
import { useMemo } from "react";
import debounce from "lodash/debounce";
import { Button } from "@/components/ui/button";

const PLAYLISTS_PER_PAGE = 5;

export function FlashcardsList() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [allPlaylists, setAllPlaylists] = useState<any[]>([]);

  console.log('AuthContext user:', user); // Debug auth state

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedTerm(value);
        setPage(0);
        setAllPlaylists([]);
        setHasMore(true);
      }, 150),
    []
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const { data: paginatedFlashcards = [], isLoading, error, isFetching } = useQuery({
    queryKey: ['flashcards', user?.id, debouncedTerm, page],
    queryFn: async () => {
      console.log(`Fetching page ${page} for user:`, user?.id);
      if (!user) {
        console.log('No user found, returning empty array');
        return [];
      }

      const from = page * PLAYLISTS_PER_PAGE;
      const to = from + PLAYLISTS_PER_PAGE - 1;

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
        console.log('Applying search term:', debouncedTerm);
        query = query.ilike('playlist_name', `%${debouncedTerm}%`);
      }

      query = query.order('playlist_name');
      query = query.range(from, to);

      const { data, error, count } = await query;
      
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      console.log('Query successful, received data:', data?.length || 0, 'items');

      if (data.length < PLAYLISTS_PER_PAGE) {
        setHasMore(false);
      }

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
    keepPreviousData: true,
  });

  useEffect(() => {
    if (paginatedFlashcards?.length > 0) {
      if (page === 0) {
        setAllPlaylists(paginatedFlashcards);
      } else {
        setAllPlaylists(prev => [...prev, ...paginatedFlashcards]);
      }
    } else if (page === 0 && paginatedFlashcards?.length === 0) {
      setAllPlaylists([]);
      setHasMore(false);
    }
  }, [paginatedFlashcards, page]);

  const loadMore = () => {
    if (!isFetching && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  if (isLoading && page === 0) {
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
    console.error('Rendering error state:', error);
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

  if (!allPlaylists.length && !debouncedTerm) {
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
        {allPlaylists.length === 0 ? (
          <div className="text-center text-muted-foreground">
            {debouncedTerm ? "No playlists found" : "No playlists available"}
          </div>
        ) : (
          <>
            {allPlaylists.map((playlist: any) => (
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
            ))}
            
            {hasMore && (
              <div className="flex justify-center mt-4">
                <Button 
                  onClick={loadMore} 
                  disabled={isFetching}
                  variant="outline"
                  className="w-full max-w-xs"
                >
                  {isFetching ? "Loading..." : "Load More Playlists"}
                </Button>
              </div>
            )}
            
            {isFetching && page > 0 && (
              <div className="animate-pulse mt-4">
                <div className="h-32 bg-gray-200 rounded-lg mb-4" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
