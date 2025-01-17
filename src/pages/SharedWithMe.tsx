import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FlashcardsList } from "@/components/profile/FlashcardsList";

export default function SharedWithMe() {
  const { user } = useAuth();

  const { data: sharedFlashcards } = useQuery({
    queryKey: ['shared-flashcards', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('recipient_id', user?.id);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Shared With Me</h1>
      <FlashcardsList flashcards={sharedFlashcards || []} />
    </div>
  );
}