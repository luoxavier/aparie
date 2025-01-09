import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Flashcard } from "@/components/Flashcard";
import { Button } from "@/components/ui/button";
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
  created: Flashcard[];
  received: Flashcard[];
}

export function FlashcardsList() {
  const { user } = useAuth();
  const [isStudying, setIsStudying] = useState(false);
  const [currentDeck, setCurrentDeck] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mistakes, setMistakes] = useState<Flashcard[]>([]);

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

  // Group flashcards by created and received
  const groupedFlashcards: GroupedFlashcards = {
    created: flashcards.filter(f => f.creator_id === user?.id),
    received: flashcards.filter(f => f.creator_id !== user?.id)
  };

  const startStudying = (deck: Flashcard[]) => {
    setCurrentDeck([...deck]);
    setCurrentCardIndex(0);
    setStreak(0);
    setMistakes([]);
    setIsStudying(true);
  };

  const handleCardResult = (correct: boolean) => {
    const currentCard = currentDeck[currentCardIndex];
    
    if (correct) {
      setStreak(streak + 1);
    } else {
      setStreak(0);
      if (!mistakes.find(card => card.id === currentCard.id)) {
        setMistakes([...mistakes, currentCard]);
      }
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex < currentDeck.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setIsStudying(false);
      setCurrentCardIndex(0);
    }
  };

  const getOtherAnswers = (currentCard: Flashcard) => {
    return currentDeck
      .filter(card => card.id !== currentCard.id)
      .map(card => card.back);
  };

  if (isStudying && currentDeck.length > 0) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setIsStudying(false)}
          className="mb-4"
        >
          ← Back to Folders
        </Button>
        
        {streak > 0 && (
          <div className="text-center mb-4">
            <span className="inline-block bg-primary text-white px-4 py-2 rounded-full">
              🔥 Streak: {streak}
            </span>
          </div>
        )}

        <Flashcard
          front={currentDeck[currentCardIndex].front}
          back={currentDeck[currentCardIndex].back}
          otherAnswers={getOtherAnswers(currentDeck[currentCardIndex])}
          onResult={handleCardResult}
          onNext={handleNextCard}
        />

        <div className="text-center text-gray-600">
          Card {currentCardIndex + 1} of {currentDeck.length}
        </div>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="space-y-4">
      <AccordionItem value="created">
        <AccordionTrigger className="text-left">
          <div className="flex items-center space-x-2">
            <span className="font-medium">
              Flashcards Created
              <span className="text-sm text-muted-foreground ml-2">
                ({groupedFlashcards.created.length} cards)
              </span>
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-4">
            <Button 
              onClick={() => startStudying(groupedFlashcards.created)}
              className="w-full"
              disabled={groupedFlashcards.created.length === 0}
            >
              Study These Cards
            </Button>
            {groupedFlashcards.created.map((flashcard) => (
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

      <AccordionItem value="received">
        <AccordionTrigger className="text-left">
          <div className="flex items-center space-x-2">
            <span className="font-medium">
              Flashcards Received
              <span className="text-sm text-muted-foreground ml-2">
                ({groupedFlashcards.received.length} cards)
              </span>
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-4">
            <Button 
              onClick={() => startStudying(groupedFlashcards.received)}
              className="w-full"
              disabled={groupedFlashcards.received.length === 0}
            >
              Study These Cards
            </Button>
            {groupedFlashcards.received.map((flashcard) => (
              <Card key={flashcard.id}>
                <CardContent className="p-4">
                  <p><strong>From:</strong> {flashcard.creator.display_name}</p>
                  <p><strong>Front:</strong> {flashcard.front}</p>
                  <p><strong>Back:</strong> {flashcard.back}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}