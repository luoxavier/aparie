import { useState, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Minus } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  creator_id: string;
}

interface CreateMultipleCardsProps {
  recipientId?: string;
  onSave?: () => void;
  existingCards?: Flashcard[];
  folderName?: string;
}

interface CardPair {
  front: string;
  back: string;
}

export function CreateMultipleCards({ recipientId, onSave, existingCards, folderName: initialFolderName }: CreateMultipleCardsProps) {
  const [folderName, setFolderName] = useState(initialFolderName || "");
  const [cards, setCards] = useState<CardPair[]>([{ front: "", back: "" }]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (existingCards?.length) {
      setCards(existingCards.map(card => ({
        front: card.front,
        back: card.back
      })));
    }
  }, [existingCards]);

  const addCard = () => {
    setCards([...cards, { front: "", back: "" }]);
  };

  const updateCard = (index: number, field: keyof CardPair, value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  const removeCard = (index: number) => {
    if (cards.length > 1) {
      const newCards = cards.filter((_, i) => i !== index);
      setCards(newCards);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>, index: number, field: keyof CardPair) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'back') {
        addCard();
        // Focus the front input of the new card after a short delay
        setTimeout(() => {
          const nextInput = document.getElementById(`front-${index + 1}`);
          nextInput?.focus();
        }, 0);
      } else {
        // Focus the back input of the current card
        const backInput = document.getElementById(`back-${index}`);
        backInput?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create flashcards",
        variant: "destructive",
      });
      return;
    }

    if (!folderName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a folder name",
        variant: "destructive",
      });
      return;
    }

    const validCards = cards.filter(card => card.front.trim() && card.back.trim());
    if (validCards.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one valid flashcard",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('flashcards')
        .insert(
          validCards.map(card => ({
            front: card.front.trim(),
            back: card.back.trim(),
            creator_id: user.id,
            recipient_id: recipientId || null,
            folder_name: folderName.trim()
          }))
        );

      if (error) throw error;

      toast({
        title: "Success",
        description: `Created ${validCards.length} flashcards in folder "${folderName}"`,
      });

      if (onSave) {
        onSave();
      }

      if (!existingCards) {
        setFolderName("");
        setCards([{ front: "", back: "" }]);
      }
    } catch (error) {
      console.error('Error creating flashcards:', error);
      toast({
        title: "Error",
        description: "Failed to create flashcards",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="folderName">Folder Name</Label>
            <Input
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              required
            />
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 px-4">
              <Label>Front</Label>
              <Label>Back</Label>
            </div>
            
            {cards.map((card, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <Input
                    id={`front-${index}`}
                    value={card.front}
                    onChange={(e) => updateCard(index, "front", e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, index, "front")}
                    placeholder="Front text"
                    required
                  />
                  <Input
                    id={`back-${index}`}
                    value={card.back}
                    onChange={(e) => updateCard(index, "back", e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, index, "back")}
                    placeholder="Back text"
                    required
                  />
                </div>
                {cards.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCard(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button type="button" variant="outline" onClick={addCard} className="flex-1">
            Add Another Card
          </Button>
          <Button type="submit" className="flex-1">
            {existingCards ? 'Update Folder' : 'Submit Folder'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}