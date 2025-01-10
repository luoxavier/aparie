import { useState, useEffect } from "react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FolderContent } from "./folder/FolderContent";
import { FolderHeader } from "./folder/FolderHeader";
import { FolderActions } from "./folder/FolderActions";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Creator {
  display_name: string;
  username: string | null;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  creator_id: string;
  creator: Creator;
}

interface FlashcardFolderProps {
  title: string;
  flashcards: Flashcard[];
  onStudy: (flashcards: Flashcard[]) => void;
  showCreator?: boolean;
  creatorId?: string;
  folderName?: string;
}

export function FlashcardFolder({ 
  title, 
  flashcards, 
  onStudy,
  showCreator = true,
  creatorId,
  folderName
}: FlashcardFolderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCards, setShowCards] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Check if folder is favorited
  const checkFavoriteStatus = async () => {
    if (!user?.id || !creatorId || !folderName) return;

    try {
      const { data, error } = await supabase
        .from('favorite_folders')
        .select('*')
        .eq('user_id', user.id)
        .eq('creator_id', creatorId)
        .eq('folder_name', folderName)
        .maybeSingle();

      if (error) throw error;
      setIsFavorited(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async () => {
    if (!user?.id || !creatorId || !folderName) return;

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('favorite_folders')
          .delete()
          .eq('user_id', user.id)
          .eq('creator_id', creatorId)
          .eq('folder_name', folderName);

        if (error) throw error;
        setIsFavorited(false);
        toast({
          title: "Folder removed from favorites",
          description: "The folder has been removed from your favorites.",
        });
      } else {
        const { error } = await supabase
          .from('favorite_folders')
          .insert({
            user_id: user.id,
            creator_id: creatorId,
            folder_name: folderName,
          });

        if (error) throw error;
        setIsFavorited(true);
        toast({
          title: "Folder added to favorites",
          description: "The folder has been added to your favorites.",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "There was an error updating your favorites.",
        variant: "destructive",
      });
    }
  };

  // Check favorite status on mount and when dependencies change
  useEffect(() => {
    checkFavoriteStatus();
  }, [user?.id, creatorId, folderName]);

  const isMyFlashcards = creatorId === user?.id;
  const isFromFriend = !isMyFlashcards && creatorId && folderName;

  return (
    <AccordionItem value={title} className="border rounded-lg">
      <AccordionTrigger className="px-4 hover:no-underline [&[data-state=open]>div>div>svg]:rotate-180">
        <FolderHeader
          title={title}
          flashcardsCount={flashcards.length}
          isMyFlashcards={isMyFlashcards}
          isFromFriend={isFromFriend}
          isFavorited={isFavorited}
          showCards={showCards}
          onToggleCards={() => setShowCards(!showCards)}
          onFavorite={toggleFavorite}
        />
      </AccordionTrigger>
      <AccordionContent className="space-y-4 px-4 pb-4">
        <FolderContent
          flashcards={flashcards}
          showCards={showCards}
          showCreator={showCreator}
        />
        <FolderActions
          isMyFlashcards={isMyFlashcards}
          isFromFriend={isFromFriend}
          flashcards={flashcards}
          userId={user?.id}
          folderName={folderName}
          onStudy={() => onStudy(flashcards)}
        />
      </AccordionContent>
    </AccordionItem>
  );
}