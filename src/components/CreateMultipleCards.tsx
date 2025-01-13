import { useAuth } from "@/contexts/AuthContext";
import { Profile } from "@/types/database";
import { CreateMultipleCardsForm } from "./flashcard/CreateMultipleCardsForm";
import { useFlashcardManagement } from "./flashcard/useFlashcardManagement";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const { handleModification, handleCreation } = useFlashcardManagement({
    userId: user?.id,
    onComplete,
    onSave
  });

  const sendNotification = async (recipientId: string, playlistName: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          recipient_id: recipientId,
          sender_id: user.id,
          type: 'shared_playlist',
          content: {
            playlistName,
            message: "has created a playlist for you"
          }
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (formData: {
    recipientId: string;
    playlistName: string;
    cards: Flashcard[];
    allowRecipientModify: boolean;
    isPublic: boolean;
  }) => {
    if (!user) return;

    try {
      if (isModifying && existingCards) {
        await handleModification(
          formData.cards,
          formData.recipientId,
          formData.playlistName,
          initialPlaylistName,
          existingCards,
          formData.isPublic
        );
      } else {
        await handleCreation(
          formData.cards,
          formData.recipientId,
          formData.playlistName,
          formData.allowRecipientModify,
          formData.isPublic
        );
        
        // Send notification only when creating a new playlist for a recipient
        if (formData.recipientId && formData.recipientId !== user.id) {
          await sendNotification(formData.recipientId, formData.playlistName);
        }
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