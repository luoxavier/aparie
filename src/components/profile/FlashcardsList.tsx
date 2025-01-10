import { Accordion } from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { FlashcardFolder } from "./FlashcardFolder";
import { StudyMode } from "./StudyMode";
import { EmptyFlashcardsState } from "./EmptyFlashcardsState";

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
  folder_name: string | null;
}

interface GroupedFlashcards {
  created: {
    [folderName: string]: Flashcard[];
  };
  received: {
    [creatorId: string]: {
      creator: Creator;
      folders: {
        [folderName: string]: Flashcard[];
      };
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
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) return <div className="text-center">Loading flashcards...</div>;
  if (error) return <div className="text-center text-red-500">Error loading flashcards</div>;
  if (!flashcards?.length) return <EmptyFlashcardsState />;

  const groupedFlashcards: GroupedFlashcards = {
    created: {},
    received: {}
  };

  // Group flashcards by folder name for created cards
  flashcards
    .filter(f => f.creator_id === user?.id)
    .forEach(flashcard => {
      const folderName = flashcard.folder_name || 'Uncategorized';
      if (!groupedFlashcards.created[folderName]) {
        groupedFlashcards.created[folderName] = [];
      }
      groupedFlashcards.created[folderName].push(flashcard);
    });

  // Group flashcards by creator and then by folder name for received cards
  flashcards
    .filter(f => f.recipient_id === user?.id && f.creator_id !== user?.id)
    .forEach(flashcard => {
      const creatorId = flashcard.creator_id;
      const folderName = flashcard.folder_name || 'Uncategorized';
      
      if (!groupedFlashcards.received[creatorId]) {
        groupedFlashcards.received[creatorId] = {
          creator: flashcard.creator,
          folders: {}
        };
      }
      
      if (!groupedFlashcards.received[creatorId].folders[folderName]) {
        groupedFlashcards.received[creatorId].folders[folderName] = [];
      }
      
      groupedFlashcards.received[creatorId].folders[folderName].push(flashcard);
    });

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
    <div className="space-y-4">
      <Accordion type="single" collapsible className="space-y-4">
        {/* My Flashcards section */}
        {Object.entries(groupedFlashcards.created).map(([folderName, cards]) => (
          <FlashcardFolder
            key={`my-${folderName}`}
            title={`My Flashcards - ${folderName}`}
            flashcards={cards}
            onStudy={startStudying}
            folderName={folderName}
            creatorId={user?.id}
          />
        ))}

        {/* Received Flashcards section */}
        {Object.entries(groupedFlashcards.received).map(([creatorId, { creator, folders }]) => (
          Object.entries(folders).map(([folderName, cards]) => (
            <FlashcardFolder
              key={`${creatorId}-${folderName}`}
              title={`${folderName} from ${creator.display_name}`}
              flashcards={cards}
              onStudy={startStudying}
              showCreator={false}
              creatorId={creatorId}
              folderName={folderName}
            />
          ))
        ))}
      </Accordion>
    </div>
  );
}