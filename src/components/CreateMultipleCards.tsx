import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Profile, Flashcard } from "@/types/database";
import { useFriendsList } from "./profile/FriendSelector";

interface CreateMultipleCardsProps {
  preselectedFriend?: Profile;
  onComplete?: () => void;
  onSave?: () => void;
  recipientId?: string;
  existingCards?: Flashcard[];
  folderName?: string;
}

export function CreateMultipleCards({ 
  preselectedFriend,
  onComplete,
  onSave,
  recipientId: initialRecipientId,
  existingCards = [],
  folderName: initialFolderName = "",
}: CreateMultipleCardsProps) {
  const { user } = useAuth();
  const [recipientId, setRecipientId] = useState<string>(initialRecipientId || preselectedFriend?.id || "");
  const [folderName, setFolderName] = useState(initialFolderName);
  const [cards, setCards] = useState(
    existingCards.length > 0 
      ? existingCards.map(card => ({ front: card.front, back: card.back }))
      : [{ front: "", back: "" }]
  );
  const { data: friends = [] } = useFriendsList();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase.from("flashcards").insert(
        cards.map((card) => ({
          creator_id: user.id,
          recipient_id: recipientId || null,
          folder_name: folderName,
          front: card.front,
          back: card.back,
        }))
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Flashcards created successfully!",
      });

      onComplete?.();
      onSave?.();
    } catch (error) {
      console.error("Error creating flashcards:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create flashcards. Please try again.",
      });
    }
  };

  const addCard = () => {
    setCards([...cards, { front: "", back: "" }]);
  };

  const updateCard = (index: number, field: "front" | "back", value: string) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Create for</Label>
        <Select value={recipientId} onValueChange={setRecipientId}>
          <SelectTrigger>
            <SelectValue placeholder="Select recipient" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Myself</SelectItem>
            {friends.map((friend) => (
              <SelectItem key={friend.id} value={friend.id}>
                {friend.display_name || friend.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Folder Name</Label>
        <Input
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Enter folder name"
          required
        />
      </div>

      {cards.map((card, index) => (
        <div key={index} className="space-y-2 p-4 border rounded">
          <div className="space-y-2">
            <Label>Front</Label>
            <Input
              value={card.front}
              onChange={(e) => updateCard(index, "front", e.target.value)}
              placeholder="Front of card"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Back</Label>
            <Input
              value={card.back}
              onChange={(e) => updateCard(index, "back", e.target.value)}
              placeholder="Back of card"
              required
            />
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addCard}>
        Add Another Card
      </Button>

      <Button type="submit" className="w-full">
        Create Flashcards
      </Button>
    </form>
  );
}