import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
}

interface GroupedFlashcards {
  [creatorId: string]: {
    creator: Creator;
    flashcards: Flashcard[];
  };
}

export function FlashcardsList() {
  const { user } = useAuth();

  const { data: flashcards, isLoading, error } = useQuery({
    queryKey: ['flashcards', user?.id],
    queryFn: async () => {
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
    enabled: !!user?.id,
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

  // Group flashcards by creator
  const groupedFlashcards = flashcards.reduce<GroupedFlashcards>((acc, flashcard) => {
    if (!acc[flashcard.creator_id]) {
      acc[flashcard.creator_id] = {
        creator: flashcard.creator,
        flashcards: [],
      };
    }
    acc[flashcard.creator_id].flashcards.push(flashcard);
    return acc;
  }, {});

  return (
    <Accordion type="single" collapsible className="space-y-4">
      {Object.entries(groupedFlashcards).map(([creatorId, group]) => (
        <AccordionItem key={creatorId} value={creatorId}>
          <AccordionTrigger className="text-left">
            <div className="flex items-center space-x-2">
              <span className="font-medium">
                {creatorId === user?.id ? 'My Flashcards' : `From ${group.creator.display_name}`}
                {group.creator.username && creatorId !== user?.id && (
                  <span className="text-sm text-muted-foreground ml-1">
                    @{group.creator.username}
                  </span>
                )}
              </span>
              <span className="text-sm text-muted-foreground">
                ({group.flashcards.length} cards)
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              {group.flashcards.map((flashcard) => (
                <Card key={flashcard.id}>
                  <CardContent className="p-4">
                    <p><strong>Front:</strong> {flashcard.front}</p>
                    <p><strong>Back:</strong> {flashcard.back}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}