import { Accordion } from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { FlashcardFolder } from "./FlashcardFolder";
import { StudyMode } from "./StudyMode";

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
  created: Flashcard[];
  received: {
    [creatorId: string]: {
      creator: Creator;
      flashcards: Flashcard[];
    };
  };
}

export function FlashcardsList() {
  const { user } = useAuth();
  const [isStudying, setIsStudying] = useState(false);
  const [currentDeck, setCurrentDeck] = useState<Flashcard[]>([]);

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
        .or(`creator_id.eq.${user.id},recipient_id.eq.${user.id}`);
      
      if (error) {
        console.error('Error fetching flashcards:', error);
        throw error;
      }
      
      console.log('Fetched flashcards:', data);
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

  const groupedFlashcards: GroupedFlashcards = {
    created: flashcards.filter(f => f.creator_id === user?.id),
    received: flashcards
      .filter(f => f.recipient_id === user?.id && f.creator_id !== user?.id)
      .reduce((acc, flashcard) => {
        const creatorId = flashcard.creator_id;
        if (!acc[creatorId]) {
          acc[creatorId] = {
            creator: flashcard.creator,
            flashcards: [],
          };
        }
        acc[creatorId].flashcards.push(flashcard);
        return acc;
      }, {} as GroupedFlashcards['received'])
  };

  const startStudying = (deck: Flashcard[]) => {
    setCurrentDeck([...deck]);
    setIsStudying(true);
  };

  if (isStudying && currentDeck.length > 0) {
    return (
      <StudyMode 
        deck={currentDeck}
        onExit={() => setIsStudying(false)}
      />
    );
  }

  return (
    <Accordion type="single" collapsible className="space-y-4">
      <FlashcardFolder
        title="Flashcards Created"
        flashcards={groupedFlashcards.created}
        onStudy={startStudying}
      />
      {Object.entries(groupedFlashcards.received).map(([creatorId, { creator, flashcards }]) => (
        <FlashcardFolder
          key={creatorId}
          title={`Flashcards from ${creator.display_name}`}
          flashcards={flashcards}
          onStudy={startStudying}
          showCreator={false}
        />
      ))}
    </Accordion>
  );
}