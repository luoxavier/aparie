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
import { Profile } from "@/types/database";
import { useFriendsList } from "./profile/FriendSelector";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  creator_id: string;
  creator: {
    display_name: string;
    username: string | null;
  };
}

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
  existingCards,
  folderName: initialFolderName 
}: CreateMultipleCardsProps) {
  const { user } = useAuth();
  const [recipientId, setRecipientId] = useState<string>(initialRecipientId || preselectedFriend?.id || "self");
  const [folderName, setFolderName] = useState(initialFolderName || "");
  const [cards, setCards] = useState(existingCards?.map(card => ({
    front: card.front,
    back: card.back
  })) || [{ front: "", back: "" }]);
  const { data: friends = [] } = useFriendsList();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase.from("flashcards").insert(
        cards.map((card) => ({
          creator_id: user.id,
          recipient_id: recipientId === "self" ? null : recipientId,
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

  const removeCard = (index: number) => {
    if (cards.length > 1) {
      const newCards = cards.filter((_, i) => i !== index);
      setCards(newCards);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, index: number, field: "front" | "back") => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (field === "front") {
        document.getElementById(`back-${index}`)?.focus();
      } else if (index === cards.length - 1) {
        addCard();
        setTimeout(() => document.getElementById(`front-${index + 1}`)?.focus(), 0);
      } else {
        document.getElementById(`front-${index + 1}`)?.focus();
      }
    }
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
            <SelectItem value="self">Myself</SelectItem>
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

      <div className="space-y-2">
        {cards.map((card, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="grid grid-cols-2 gap-4 flex-1">
              <Input
                id={`front-${index}`}
                value={card.front}
                onChange={(e) => updateCard(index, "front", e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, index, "front")}
                placeholder="Front of card"
                required
              />
              <Input
                id={`back-${index}`}
                value={card.back}
                onChange={(e) => updateCard(index, "back", e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, index, "back")}
                placeholder="Back of card"
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

      <Button type="button" variant="outline" onClick={addCard}>
        Add Another Card
      </Button>

      <Button type="submit" className="w-full">
        Create Flashcards
      </Button>
    </form>
  );
}