import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { FlashcardFolder } from "./FlashcardFolder";
import { StudyMode } from "./StudyMode";
import { EmptyFlashcardsState } from "./EmptyFlashcardsState";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateMultipleCards } from "@/components/CreateMultipleCards";

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
  recipient_id: string | null;
}

interface GroupedFlashcards {
  [creatorId: string]: {
    creator: Creator;
    folders: {
      [folderName: string]: Flashcard[];
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
          id,
          front,
          back,
          creator_id,
          recipient_id,
          folder_name,
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

  const groupedFlashcards: GroupedFlashcards = {};

  flashcards.forEach(flashcard => {
    const creatorId = flashcard.creator_id;
    const folderName = flashcard.folder_name || 'Uncategorized';
    
    if (!groupedFlashcards[creatorId]) {
      groupedFlashcards[creatorId] = {
        creator: flashcard.creator,
        folders: {}
      };
    }
    
    if (!groupedFlashcards[creatorId].folders[folderName]) {
      groupedFlashcards[creatorId].folders[folderName] = [];
    }
    
    groupedFlashcards[creatorId].folders[folderName].push(flashcard);
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
    <div className="space-y-8">
      {Object.entries(groupedFlashcards).map(([creatorId, { creator, folders }]) => (
        <div key={creatorId} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              {creatorId === user?.id ? 'My Flashcards' : `Flashcards from ${creator.display_name}`}
            </h3>
          </div>
          <div className="space-y-3">
            {Object.entries(folders).map(([folderName, cards]) => (
              <FlashcardFolder
                key={`${creatorId}-${folderName}`}
                title={folderName}
                flashcards={cards}
                onStudy={startStudying}
                showCreator={false}
                creatorId={creatorId}
                folderName={folderName}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}