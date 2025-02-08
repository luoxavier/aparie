
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

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

interface SubmitHandlerProps {
  isModifying: boolean;
  onSubmit: (formData: {
    recipientId: string;
    playlistName: string;
    cards: Flashcard[];
    allowRecipientModify: boolean;
    isPublic: boolean;
  }) => Promise<void>;
}

export function useFlashcardFormSubmit({ isModifying, onSubmit }: SubmitHandlerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleSubmit = async (formData: {
    recipientId: string;
    playlistName: string;
    cards: Flashcard[];
    allowRecipientModify: boolean;
    isPublic: boolean;
  }) => {
    if (formData.cards.some(card => !card.front.trim() || !card.back.trim())) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all card fields",
      });
      return;
    }

    if (!formData.playlistName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a playlist name",
      });
      return;
    }

    try {
      await onSubmit(formData);

      await queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });

      toast({
        title: "Success",
        description: isModifying ? "Flashcards updated successfully" : "Flashcards created successfully",
      });

      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save flashcards. Please try again.",
      });
    }
  };

  return { handleSubmit };
}
