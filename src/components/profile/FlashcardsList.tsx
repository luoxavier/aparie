
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FlashcardFolder } from "./FlashcardFolder";
import { EmptyFlashcardsState } from "./EmptyFlashcardsState";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function FlashcardsList() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: flashcards = [], isLoading, error } = useQuery({
    queryKey: ['flashcards', user?.id, searchTerm],
    queryFn: async () => {
      if (!user) return [];

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

      if (searchTerm) {
        query = query.ilike('playlist_name', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

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
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by playlist name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
            disabled
          />
        </div>
        <div className="animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg mb-4" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by playlist name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="text-center text-red-500">
          Error loading flashcards. Please try again later.
        </div>
      </div>
    );
  }

  if (!flashcards.length && !searchTerm) {
    return <EmptyFlashcardsState />;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by playlist name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="space-y-4">
        {flashcards.length === 0 ? (
          <div className="text-center text-muted-foreground">
            {searchTerm ? "No playlists found" : "No playlists available"}
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
