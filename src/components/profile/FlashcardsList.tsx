import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { FlashcardFolder } from "./FlashcardFolder";
import { StudyMode } from "./StudyMode";
import { EmptyFlashcardsState } from "./EmptyFlashcardsState";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';

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
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem('expandedSections');
    return saved ? JSON.parse(saved) : {};
  });
  const [creatorOrder, setCreatorOrder] = useState<string[]>([]);

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

  useEffect(() => {
    localStorage.setItem('expandedSections', JSON.stringify(expandedSections));
  }, [expandedSections]);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = creatorOrder.indexOf(active.id.toString());
    const newIndex = creatorOrder.indexOf(over.id.toString());
    setCreatorOrder(arrayMove(creatorOrder, oldIndex, newIndex));
  };

  const toggleSection = (creatorId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [creatorId]: !prev[creatorId]
    }));
  };

  if (isStudying && currentDeck.length > 0) {
    return (
      <StudyMode 
        deck={currentDeck}
        onExit={() => setIsStudying(false)}
      />
    );
  }

  // Ensure user's flashcards appear first
  const sortedCreators = Object.entries(groupedFlashcards).sort((a, b) => {
    if (a[0] === user?.id) return -1;
    if (b[0] === user?.id) return 1;
    return 0;
  });

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="space-y-8">
        {sortedCreators.map(([creatorId, { creator, folders }]) => (
          <div key={creatorId} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                {creatorId === user?.id ? 'My Flashcards' : `Flashcards from ${creator.display_name}`}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection(creatorId)}
                  className="ml-2"
                >
                  {expandedSections[creatorId] ? (
                    <Minus className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </h3>
            </div>
            {expandedSections[creatorId] && (
              <SortableContext items={Object.keys(folders)} strategy={verticalListSortingStrategy}>
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
              </SortableContext>
            )}
          </div>
        ))}
      </div>
    </DndContext>
  );
}