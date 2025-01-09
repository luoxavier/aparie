import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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

      // Reset form if not editing existing cards
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
          
          {cards.map((card, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Card {index + 1}</span>
                {cards.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeCard(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`front-${index}`}>Front</Label>
                  <Input
                    id={`front-${index}`}
                    value={card.front}
                    onChange={(e) => updateCard(index, "front", e.target.value)}
                    placeholder="Front text"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`back-${index}`}>Back</Label>
                  <Input
                    id={`back-${index}`}
                    value={card.back}
                    onChange={(e) => updateCard(index, "back", e.target.value)}
                    placeholder="Back text"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button type="button" variant="outline" onClick={addCard} className="flex-1">
            Add Another Card
          </Button>
          <Button type="submit" className="flex-1">
            {existingCards ? 'Update Flashcards' : 'Create Flashcards'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}