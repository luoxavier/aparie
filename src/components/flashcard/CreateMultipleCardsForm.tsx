
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Profile } from "@/types/database";
import { useFriendsList } from "../profile/FriendSelector";
import { CreateCardForm } from "./CreateCardForm";
import { RecipientSelect } from "./RecipientSelect";
import { FolderNameInput } from "./FolderNameInput";
import { RecipientModifyToggle } from "./RecipientModifyToggle";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { PublicPlaylistToggle } from "./PublicPlaylistToggle";
import { useFlashcardFormSubmit } from "./useFlashcardFormSubmit";
import { useFlashcardState } from "./useFlashcardState";

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
  }) => Promise<void>;
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
  const [allowRecipientModify, setAllowRecipientModify] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const { data: friends = [] } = useFriendsList();
  
  const { cards, addCard, updateCard, removeCard, handleKeyPress } = useFlashcardState(existingCards);
  const { handleSubmit } = useFlashcardFormSubmit({ isModifying, onSubmit });

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit({
      recipientId,
      playlistName,
      cards,
      allowRecipientModify,
      isPublic
    });
  };

  const showModifyToggle = (!isPublic && (recipientId !== "self" || isModifying));

  return (
    <form onSubmit={onFormSubmit} className="space-y-4">
      <PublicPlaylistToggle isPublic={isPublic} setIsPublic={setIsPublic} />

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

      {showModifyToggle && (
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

      <DialogClose asChild>
        <Button type="submit" className="w-full">
          {isModifying ? "Save and Close" : "Create and Close"}
        </Button>
      </DialogClose>
    </form>
  );
}
