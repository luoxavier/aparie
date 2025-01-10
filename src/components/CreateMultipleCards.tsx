import { useState, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { RecipientSelect } from "./flashcards/create/RecipientSelect";
import { CardPairInput } from "./flashcards/create/CardPairInput";
import { CardPair, Flashcard } from "./flashcards/types";

interface CreateMultipleCardsProps {
  recipientId?: string;
  onSave?: () => void;
  existingCards?: Flashcard[];
  folderName?: string;
}

export function CreateMultipleCards({ 
  recipientId: initialRecipientId, 
  onSave, 
  existingCards, 
  folderName: initialFolderName 
}: CreateMultipleCardsProps) {
  const [folderName, setFolderName] = useState(initialFolderName || "");
  const [cards, setCards] = useState<CardPair[]>([{ front: "", back: "" }]);
  const [selectedRecipient, setSelectedRecipient] = useState(initialRecipientId || "myself");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: friends } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('friend_connections')
        .select(`
          friend:profiles!friend_connections_friend_id_fkey (
            id,
            display_name
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');
      
      if (error) throw error;
      return data.map(d => d.friend);
    },
    enabled: !!user?.id,
  });

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
        setTimeout(() => {
          const nextInput = document.getElementById(`front-${index + 1}`);
          nextInput?.focus();
        }, 0);
      } else {
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
      const finalRecipientId = selectedRecipient === "myself" ? null : selectedRecipient;

      const { error: cardsError } = await supabase
        .from('flashcards')
        .insert(
          validCards.map(card => ({
            front: card.front.trim(),
            back: card.back.trim(),
            creator_id: user.id,
            recipient_id: finalRecipientId,
            folder_name: folderName.trim()
          }))
        );

      if (cardsError) throw cardsError;

      if (finalRecipientId) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            recipient_id: finalRecipientId,
            sender_id: user.id,
            type: 'new_flashcard',
            content: { folder_name: folderName.trim() }
          });

        if (notificationError) throw notificationError;
      }

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
          <div className="grid gap-4 md:grid-cols-2">
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
            <RecipientSelect
              selectedRecipient={selectedRecipient}
              setSelectedRecipient={setSelectedRecipient}
              friends={friends}
              initialRecipientId={initialRecipientId}
            />
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 px-4">
              <Label>Front</Label>
              <Label>Back</Label>
            </div>
            
            <div className="space-y-2">
              {cards.map((card, index) => (
                <CardPairInput
                  key={index}
                  index={index}
                  card={card}
                  updateCard={updateCard}
                  removeCard={removeCard}
                  handleKeyPress={handleKeyPress}
                  showRemoveButton={cards.length > 1}
                />
              ))}
            </div>
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