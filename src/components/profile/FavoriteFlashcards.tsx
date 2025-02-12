
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FlashcardFolder } from "./FlashcardFolder";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Creator {
  display_name: string;
  username: string | null;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  creator_id: string;
  creator: Creator;
  playlist_name: string;
}

export function FavoriteFlashcards() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorite-folders', user?.id, searchTerm],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('favorite_folders')
        .select('*, creator:profiles!favorite_folders_creator_id_fkey(display_name, username)')
        .eq('user_id', user.id);

      if (searchTerm) {
        query = query.ilike('playlist_name', `%${searchTerm}%`);
      }

      const { data: favoriteData, error: favoriteError } = await query;

      if (favoriteError) throw favoriteError;

      const flashcardsPromises = favoriteData.map(async (favorite) => {
        const { data: flashcardsData, error: flashcardsError } = await supabase
          .from('flashcards')
          .select(`
            *,
            creator:profiles!flashcards_creator_id_fkey (
              display_name,
              username
            )
          `)
          .eq('creator_id', favorite.creator_id)
          .eq('playlist_name', favorite.playlist_name);

        if (flashcardsError) throw flashcardsError;
        return {
          ...favorite,
          flashcards: flashcardsData
        };
      });

      return Promise.all(flashcardsPromises);
    },
    enabled: !!user?.id,
  });

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['favorite-folders'] });
    queryClient.invalidateQueries({ queryKey: ['flashcards'] });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search favorites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
            disabled
          />
        </div>
        <div className="text-center">Loading favorites...</div>
      </div>
    );
  }

  if (!favorites?.length && !searchTerm) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search favorites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="text-center text-gray-500">No favorite playlists found</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search favorites..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="space-y-3">
        {favorites?.map((favorite) => (
          <FlashcardFolder
            key={`${favorite.creator_id}-${favorite.playlist_name}`}
            title={favorite.playlist_name}
            subtitle={favorite.creator.display_name}
            flashcards={favorite.flashcards}
            showCreator={false}
            creatorId={favorite.creator_id}
            playlistName={favorite.playlist_name}
            onEditSuccess={handleEditSuccess}
          />
        ))}
      </div>
    </div>
  );
}
