import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function FlashcardsList() {
  const { user } = useAuth();

  const { data: flashcards, isLoading, error } = useQuery({
    queryKey: ['flashcards', user?.id],
    queryFn: async () => {
      // Only fetch flashcards if we have a user
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('flashcards')
        .select(`
          *,
          creator:profiles!flashcards_creator_id_fkey (
            display_name,
            username
          )
        `)
        .eq('creator_id', user.id);
      
      if (error) {
        console.error('Error fetching flashcards:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id, // Only run query if we have a user
  });

  if (isLoading) {
    return <div className="text-center">Loading flashcards...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading flashcards</div>;
  }

  if (!flashcards?.length) {
    return <div className="text-center text-gray-500">No flashcards found</div>;
  }

  return (
    <div className="space-y-4">
      {flashcards.map((flashcard) => (
        <Card key={flashcard.id}>
          <CardContent className="p-4">
            <div className="mb-2 text-sm text-gray-500">
              Created by: {flashcard.creator.display_name}
              {flashcard.creator.username && ` (@${flashcard.creator.username})`}
            </div>
            <p><strong>Front:</strong> {flashcard.front}</p>
            <p><strong>Back:</strong> {flashcard.back}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}