import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FolderHeader } from "./folder/FolderHeader";
import { FolderContent } from "./folder/FolderContent";
import { FolderActions } from "./folder/FolderActions";

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
  onStudy: (cards: Flashcard[]) => void;
  showCreator?: boolean;
  creatorId?: string;
  folderName?: string;
}

export function FlashcardFolder({ 
  title, 
  flashcards, 
  onStudy, 
  showCreator = false,
  creatorId,
  folderName 
}: FlashcardFolderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    const checkIfFavorited = async () => {
      if (!user || !creatorId || !folderName) return;

      const { data } = await supabase
        .from('favorite_folders')
        .select()
        .eq('user_id', user.id)
        .eq('creator_id', creatorId)
        .eq('folder_name', folderName)
        .single();

      setIsFavorited(!!data);
    };

    checkIfFavorited();
  }, [user, creatorId, folderName]);

  const handleStudy = () => {
    onStudy(flashcards);
    navigate('/study-folder', { state: { flashcards, folderName: title } });
  };

  const handleFavorite = async () => {
    if (!user || !creatorId || !folderName) return;

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
          title: "Success",
          description: "Folder removed from favorites",
        });
      } else {
        const { error } = await supabase
          .from('favorite_folders')
          .insert({
            user_id: user.id,
            creator_id: creatorId,
            folder_name: folderName
          });

        if (error) throw error;

        setIsFavorited(true);
        toast({
          title: "Success",
          description: "Folder added to favorites",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  const isMyFlashcards = title.toLowerCase().includes('my flashcards');
  const isFromFriend = title.toLowerCase().includes('from');

  return (
    <AccordionItem value={title.toLowerCase().replace(/\s+/g, '-')}>
      <AccordionTrigger className="text-left">
        <FolderHeader
          title={title}
          flashcardsCount={flashcards.length}
          isMyFlashcards={isMyFlashcards}
          isFromFriend={isFromFriend}
          isFavorited={isFavorited}
          showCards={showCards}
          onToggleCards={() => setShowCards(!showCards)}
          onFavorite={handleFavorite}
        />
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-4">
          <FolderActions
            isMyFlashcards={isMyFlashcards}
            isFromFriend={isFromFriend}
            flashcards={flashcards}
            userId={user?.id}
            folderName={folderName}
            onStudy={handleStudy}
          />
          <FolderContent
            flashcards={flashcards}
            showCards={showCards}
            showCreator={showCreator}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}