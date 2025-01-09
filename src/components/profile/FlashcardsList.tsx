import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function FlashcardsList() {
  const { user } = useAuth();

  const { data: flashcards } = useQuery({
    queryKey: ['flashcards', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('creator_id', user?.id);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      {flashcards?.map((flashcard) => (
        <Card key={flashcard.id}>
          <CardContent className="p-4">
            <p><strong>Front:</strong> {flashcard.front}</p>
            <p><strong>Back:</strong> {flashcard.back}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}