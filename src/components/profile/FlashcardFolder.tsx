import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FolderContent } from "./folder/FolderContent";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateMultipleCards } from "@/components/CreateMultipleCards";
import { useQueryClient } from "@tanstack/react-query";
import { FolderActions } from "../flashcard/FolderActions";

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
  const queryClient = useQueryClient();
  const [showCards, setShowCards] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, [user?.id, creatorId, folderName]);

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
      queryClient.invalidateQueries({ queryKey: ['favorite-folders'] });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "There was an error updating your favorites.",
        variant: "destructive",
      });
    }
  };

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

  const handleFolderClick = () => {
    setShowCards(!showCards);
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    toast({
      title: "Success",
      description: "Flashcards updated successfully",
    });
  };

  return (
    <Card 
      className="p-4 hover:bg-accent/50 transition-colors cursor-pointer mb-3"
      onClick={handleFolderClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div>
            <div className="flex items-baseline gap-1">
              <h3 className="text-base font-medium">
                {title}
                <span className="text-sm text-muted-foreground ml-2">
                  ({flashcards.length} cards)
                </span>
              </h3>
              {subtitle && (
                <span className="text-xs text-muted-foreground">
                  {subtitle}
                </span>
              )}
            </div>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <FolderActions
              isFavorited={isFavorited}
              onFavoriteClick={toggleFavorite}
              onStudyClick={handleStudy}
              onEditClick={(e) => e.stopPropagation()}
            />
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Modify Flashcards</DialogTitle>
            </DialogHeader>
            <CreateMultipleCards 
              recipientId={user?.id}
              existingCards={flashcards}
              folderName={folderName}
              onSave={handleEditSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-4">
        <FolderContent
          flashcards={flashcards}
          showCards={showCards}
          showCreator={showCreator}
        />
      </div>
    </Card>
  );
}