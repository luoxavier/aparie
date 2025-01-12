import { useAuth } from "@/contexts/AuthContext";
import { Profile } from "@/types/database";
import { CreateMultipleCardsForm } from "./flashcard/CreateMultipleCardsForm";
import { useFlashcardManagement } from "./flashcard/useFlashcardManagement";

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
  playlistName?: string;
  isModifying?: boolean;
  hideRecipientSelect?: boolean;
}

export function CreateMultipleCards({ 
  preselectedFriend, 
  onComplete,
  onSave,
  recipientId: initialRecipientId,
  existingCards,
  playlistName: initialPlaylistName,
  isModifying = false,
  hideRecipientSelect = false
}: CreateMultipleCardsProps) {
  const { user } = useAuth();
  const { handleModification, handleCreation } = useFlashcardManagement({
    userId: user?.id,
    onComplete,
    onSave
  });

  const handleSubmit = async (formData: {
    recipientId: string;
    playlistName: string;
    cards: Flashcard[];
    allowRecipientModify: boolean;
  }) => {
    if (!user) return;

    try {
      if (isModifying && existingCards) {
        await handleModification(
          formData.cards,
          formData.recipientId,
          formData.playlistName,
          initialPlaylistName,
          existingCards
        );
      } else {
        await handleCreation(
          formData.cards,
          formData.recipientId,
          formData.playlistName,
          formData.allowRecipientModify
        );
      }

      onComplete?.();
      onSave?.();
    } catch (error) {
      console.error("Error managing flashcards:", error);
    }
  };

  return (
    <CreateMultipleCardsForm
      preselectedFriend={preselectedFriend}
      recipientId={initialRecipientId}
      existingCards={existingCards}
      playlistName={initialPlaylistName}
      isModifying={isModifying}
      hideRecipientSelect={hideRecipientSelect}
      onSubmit={handleSubmit}
    />
  );
}