import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Flashcard {
  id?: string;
  front: string;
  back: string;
  creator_id?: string;
}

interface UseFlashcardManagementProps {
  userId?: string;
  onComplete?: () => void;
  onSave?: () => void;
}

export function useFlashcardManagement({ userId, onComplete, onSave }: UseFlashcardManagementProps) {
  const { toast } = useToast();

  const handleModification = async (
    cards: Flashcard[],
    recipientId: string,
    playlistName: string,
    initialPlaylistName?: string,
    existingCards?: Flashcard[],
    isPublic: boolean = false
  ) => {
    if (!userId || !existingCards) return;

    try {
      // If playlist name has changed, update both flashcards and favorite_folders
      if (initialPlaylistName && playlistName !== initialPlaylistName) {
        const updateFlashcardsResult = await supabase
          .from("flashcards")
          .update({ playlist_name: playlistName })
          .eq('playlist_name', initialPlaylistName)
          .eq('creator_id', existingCards[0].creator_id); // Use original creator's ID

        if (updateFlashcardsResult.error) throw updateFlashcardsResult.error;

        const updateFavoritesResult = await supabase
          .from("favorite_folders")
          .update({ playlist_name: playlistName })
          .eq('playlist_name', initialPlaylistName)
          .eq('creator_id', existingCards[0].creator_id); // Use original creator's ID

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
            creator_id: existingCards[0].creator_id, // Maintain original creator
            recipient_id: recipientId === "self" ? null : recipientId,
            playlist_name: playlistName,
            front: card.front,
            back: card.back,
            is_public: isPublic,
            last_modified_by: userId,
            last_modified_at: new Date().toISOString()
          })));

        if (updateResult.error) throw updateResult.error;
      }

      // Handle new cards
      const newCards = cards.filter(card => !card.id);
      if (newCards.length > 0) {
        const insertResult = await supabase
          .from("flashcards")
          .insert(newCards.map(card => ({
            creator_id: existingCards[0].creator_id, // Use original creator's ID
            recipient_id: recipientId === "self" ? null : recipientId,
            playlist_name: playlistName,
            front: card.front,
            back: card.back,
            is_public: isPublic,
            last_modified_by: userId,
            last_modified_at: new Date().toISOString()
          })));

        if (insertResult.error) throw insertResult.error;
      }

      toast({
        title: "Success",
        description: "Playlist updated successfully!",
      });
    } catch (error) {
      console.error("Error managing flashcards:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update flashcards. Please try again.",
      });
      throw error;
    }
  };

  const handleCreation = async (
    cards: Flashcard[],
    recipientId: string,
    playlistName: string,
    allowRecipientModify: boolean,
    isPublic: boolean = false
  ) => {
    if (!userId) return;

    try {
      const insertResult = await supabase
        .from("flashcards")
        .insert(cards.map(card => ({
          front: card.front,
          back: card.back,
          creator_id: userId,
          recipient_id: recipientId === "self" ? null : recipientId,
          playlist_name: playlistName,
          recipient_can_modify: recipientId !== "self" ? allowRecipientModify : false,
          is_public: isPublic
        })));

      if (insertResult.error) throw insertResult.error;

      toast({
        title: "Success",
        description: "Flashcards created successfully!",
      });
    } catch (error) {
      console.error("Error creating flashcards:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create flashcards. Please try again.",
      });
      throw error;
    }
  };

  return {
    handleModification,
    handleCreation
  };
}