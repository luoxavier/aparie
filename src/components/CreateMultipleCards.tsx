import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Profile } from "@/types/database";
import { useFriendsList } from "./profile/FriendSelector";
import { CreateCardForm } from "./flashcard/CreateCardForm";
import { RecipientSelect } from "./flashcard/RecipientSelect";
import { FolderNameInput } from "./flashcard/FolderNameInput";
import { RecipientModifyToggle } from "./flashcard/RecipientModifyToggle";

interface Flashcard {
  id?: string;
  front: string;
  back: string;
  creator_id?: string;
  creator?: {
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
  isModifying?: boolean;
  hideRecipientSelect?: boolean;
}

export function CreateMultipleCards({ 
  preselectedFriend, 
  onComplete,
  onSave,
  recipientId: initialRecipientId,
  existingCards,
  folderName: initialFolderName,
  isModifying = false,
  hideRecipientSelect = false
}: CreateMultipleCardsProps) {
  const { user } = useAuth();
  const [recipientId, setRecipientId] = useState<string>(initialRecipientId || preselectedFriend?.id || "self");
  const [folderName, setFolderName] = useState(initialFolderName || "");
  const [cards, setCards] = useState<Flashcard[]>(existingCards?.map(card => ({
    id: card.id,
    front: card.front,
    back: card.back
  })) || [{ front: "", back: "" }]);
  const [allowRecipientModify, setAllowRecipientModify] = useState(false);
  const { data: friends = [] } = useFriendsList();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (isModifying && existingCards) {
        await handleModification();
      } else {
        await handleCreation();
      }

      onComplete?.();
      onSave?.();
    } catch (error) {
      console.error("Error managing flashcards:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isModifying ? 'update' : 'create'} flashcards. Please try again.`,
      });
    }
  };

  const handleModification = async () => {
    if (!user || !existingCards) return;

    // If folder name has changed, update both flashcards and favorite_folders
    if (initialFolderName && folderName !== initialFolderName) {
      const updateFlashcardsResult = await supabase
        .from("flashcards")
        .update({ folder_name: folderName })
        .eq('creator_id', user.id)
        .eq('folder_name', initialFolderName);

      if (updateFlashcardsResult.error) throw updateFlashcardsResult.error;

      const updateFavoritesResult = await supabase
        .from("favorite_folders")
        .update({ folder_name: folderName })
        .eq('creator_id', user.id)
        .eq('folder_name', initialFolderName);

      if (updateFavoritesResult.error) throw updateFavoritesResult.error;
    }

    // Handle deletions
    const deletedCards = existingCards.filter(existingCard => 
      !cards.some(card => card.id === existingCard.id)
    );
    
    if (deletedCards.length > 0) {
      const deleteResult = await supabase
        .from("flashcards")
        .delete()
        .in('id', deletedCards.map(card => card.id));

      if (deleteResult.error) throw deleteResult.error;
    }

    // Handle updates for existing cards
    const cardsToUpdate = cards.filter(card => card.id);
    if (cardsToUpdate.length > 0) {
      const updateResult = await supabase
        .from("flashcards")
        .upsert(cardsToUpdate.map(card => ({
          id: card.id,
          creator_id: user.id,
          recipient_id: recipientId === "self" ? null : recipientId,
          folder_name: folderName,
          front: card.front,
          back: card.back,
        })));

      if (updateResult.error) throw updateResult.error;
    }

    // Handle new cards
    const newCards = cards.filter(card => !card.id);
    if (newCards.length > 0) {
      const insertResult = await supabase
        .from("flashcards")
        .insert(newCards.map(card => ({
          creator_id: user.id,
          recipient_id: recipientId === "self" ? null : recipientId,
          folder_name: folderName,
          front: card.front,
          back: card.back,
        })));

      if (insertResult.error) throw insertResult.error;
    }

    toast({
      title: "Success",
      description: "Folder updated successfully!",
    });
  };

  const handleCreation = async () => {
    if (!user) return;

    const insertResult = await supabase
      .from("flashcards")
      .insert(cards.map(card => ({
        front: card.front,
        back: card.back,
        creator_id: user.id,
        recipient_id: recipientId === "self" ? null : recipientId,
        folder_name: folderName,
        recipient_can_modify: recipientId !== "self" ? allowRecipientModify : false
      })));

    if (insertResult.error) throw insertResult.error;

    toast({
      title: "Success",
      description: "Flashcards created successfully!",
    });
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
    const newCards = cards.filter((_, i) => i !== index);
    setCards(newCards);
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
      {!hideRecipientSelect && (
        <RecipientSelect
          recipientId={recipientId}
          setRecipientId={setRecipientId}
          friends={friends}
        />
      )}

      <FolderNameInput folderName={folderName} setFolderName={setFolderName} />

      {!isModifying && recipientId !== "self" && (
        <RecipientModifyToggle
          allowRecipientModify={allowRecipientModify}
          setAllowRecipientModify={setAllowRecipientModify}
        />
      )}

      {isModifying && (
        <>
          <Separator className="my-4" />
          <h3 className="text-lg font-semibold mb-4">Flashcards</h3>
        </>
      )}

      <CreateCardForm
        cards={cards}
        onUpdateCard={updateCard}
        onRemoveCard={removeCard}
        onKeyPress={handleKeyPress}
      />

      <Button type="button" variant="outline" onClick={addCard}>
        Add Another Card
      </Button>

      <Button type="submit" className="w-full">
        {isModifying ? "Update Folder" : "Create Flashcards"}
      </Button>
    </form>
  );
}