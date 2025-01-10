import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FolderContent } from "./folder/FolderContent";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Star, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateMultipleCards } from "@/components/CreateMultipleCards";

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
        creatorName: subtitle
      } 
    });
  };

  const handleFolderClick = () => {
    setShowCards(!showCards);
  };

  const isMyFlashcards = creatorId === user?.id;

  return (
    <Card 
      className="p-4 hover:bg-accent/50 transition-colors cursor-pointer mb-3"
      onClick={handleFolderClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFavorite}
            className={`transition-colors ${isFavorited ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'} p-0`}
          >
            <Star className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <h3 className="text-lg font-medium">
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
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleStudy}
            disabled={flashcards.length === 0}
          >
            Study
          </Button>
          {!isMyFlashcards && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Modify Flashcards</DialogTitle>
                </DialogHeader>
                <CreateMultipleCards 
                  recipientId={user?.id}
                  existingCards={flashcards}
                  folderName={folderName}
                  onSave={() => {
                    toast({
                      title: "Success",
                      description: "Flashcards updated successfully",
                    });
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
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