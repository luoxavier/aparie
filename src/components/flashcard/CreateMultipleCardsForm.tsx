import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Profile } from "@/types/database";
import { useFriendsList } from "../profile/FriendSelector";
import { CreateCardForm } from "./CreateCardForm";
import { RecipientSelect } from "./RecipientSelect";
import { FolderNameInput } from "./FolderNameInput";
import { RecipientModifyToggle } from "./RecipientModifyToggle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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

interface CreateMultipleCardsFormProps {
  preselectedFriend?: Profile;
  recipientId?: string;
  existingCards?: Flashcard[];
  playlistName?: string;
  isModifying?: boolean;
  hideRecipientSelect?: boolean;
  onSubmit: (formData: {
    recipientId: string;
    playlistName: string;
    cards: Flashcard[];
    allowRecipientModify: boolean;
    isPublic: boolean;
  }) => void;
}

export function CreateMultipleCardsForm({
  preselectedFriend,
  recipientId: initialRecipientId,
  existingCards,
  playlistName: initialPlaylistName,
  isModifying = false,
  hideRecipientSelect = false,
  onSubmit
}: CreateMultipleCardsFormProps) {
  const [recipientId, setRecipientId] = useState<string>(initialRecipientId || preselectedFriend?.id || "self");
  const [playlistName, setPlaylistName] = useState(initialPlaylistName || "");
  const [cards, setCards] = useState<Flashcard[]>(existingCards?.map(card => ({
    id: card.id,
    front: card.front,
    back: card.back
  })) || [{ front: "", back: "" }]);
  const [allowRecipientModify, setAllowRecipientModify] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const { data: friends = [] } = useFriendsList();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      recipientId,
      playlistName,
      cards,
      allowRecipientModify,
      isPublic
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
      <div className="flex items-center space-x-2">
        <Switch
          id="public-playlist"
          checked={isPublic}
          onCheckedChange={setIsPublic}
        />
        <Label htmlFor="public-playlist">Make this playlist public</Label>
      </div>

      {!hideRecipientSelect && !isPublic && (
        <RecipientSelect
          recipientId={recipientId}
          setRecipientId={setRecipientId}
          friends={friends}
        />
      )}

      <FolderNameInput 
        folderName={playlistName} 
        setFolderName={setPlaylistName}
        label="Playlist Name"
      />

      {!isModifying && recipientId !== "self" && !isPublic && (
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
        {isModifying ? "Update Playlist" : "Create Flashcards"}
      </Button>
    </form>
  );
}