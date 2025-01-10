import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import FlashcardFolder from "./FlashcardFolder";
import { Flashcard } from "@/types/flashcard";

export function FavoriteFlashcards() {
  const { user } = useAuth();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorite-folders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: favoriteData, error: favoriteError } = await supabase
        .from('favorite_folders')
        .select(`
          *,
          creator:profiles!favorite_folders_creator_id_fkey(
            id,
            display_name,
            username,
            avatar_url,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (favoriteError) throw favoriteError;

      const flashcardsPromises = favoriteData.map(async (favorite) => {
        const { data: flashcardsData, error: flashcardsError } = await supabase
          .from('flashcards')
          .select(`
            *,
            creator:profiles!flashcards_creator_id_fkey (
              id,
              display_name,
              username,
              avatar_url,
              created_at,
              updated_at
            )
          `)
          .eq('creator_id', favorite.creator_id)
          .eq('folder_name', favorite.folder_name);

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

  if (isLoading) return <div className="text-center">Loading favorites...</div>;
  if (!favorites?.length) return <div className="text-center text-gray-500">No favorite folders found</div>;

  return (
    <div className="space-y-3">
      {favorites.map((favorite) => (
        <FlashcardFolder
          key={`${favorite.creator_id}-${favorite.folder_name}`}
          folderName={favorite.folder_name}
          subtitle={favorite.creator.display_name}
          flashcards={favorite.flashcards}
          onFlashcardsChange={() => {}} // Add empty handler since we don't modify favorites
          onStudy={() => {}}
          showCreator={false}
          creatorId={favorite.creator_id}
        />
      ))}
    </div>
  );
}