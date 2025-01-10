import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FolderContent } from "./folder/FolderContent";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FolderHeader } from "./folder/FolderHeader";
import { FolderModifyDialog } from "./folder/FolderModifyDialog";

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
  subtitle?: string;
  flashcards: Flashcard[];
  onStudy: (flashcards: Flashcard[]) => void;
  showCreator?: boolean;
  creatorId?: string;
  folderName?: string;
}

export function FlashcardFolder({ 
  title, 
  subtitle,
  flashcards, 
  onStudy,
  showCreator = true,
  creatorId,
  folderName,
}: FlashcardFolderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showCards, setShowCards] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isModifyDialogOpen, setIsModifyDialogOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: `${creatorId}-${folderName}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  useEffect(() => {
    checkFavoriteStatus();
  }, [user?.id, creatorId, folderName]);

  const handleStudy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/study-folder', { 
      state: { 
        flashcards, 
        folderName: title,
        creatorName: subtitle || user?.email
      } 
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModifyDialogOpen(true);
  };

  return (
    <>
      <Card 
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="p-3 hover:bg-accent/50 transition-colors cursor-pointer mb-2"
        onClick={() => setShowCards(!showCards)}
      >
        <FolderHeader
          title={title}
          subtitle={subtitle}
          isFavorited={isFavorited}
          onFavorite={toggleFavorite}
          onStudy={handleStudy}
          onEdit={handleEdit}
        />

        <div className="mt-3">
          <FolderContent
            flashcards={flashcards}
            showCards={showCards}
            showCreator={showCreator}
          />
        </div>
      </Card>

      <FolderModifyDialog
        isOpen={isModifyDialogOpen}
        onClose={() => setIsModifyDialogOpen(false)}
        flashcards={flashcards}
        userId={user?.id}
        folderName={folderName}
      />
    </>
  );
}