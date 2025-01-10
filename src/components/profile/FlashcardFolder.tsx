import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FolderContent } from "./folder/FolderContent";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Star, Eye, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  expanded?: boolean;
}

export function FlashcardFolder({ 
  title, 
  subtitle,
  flashcards, 
  onStudy,
  showCreator = true,
  creatorId,
  folderName,
  expanded = false
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

  useEffect(() => {
    checkFavoriteStatus();
  }, [user?.id, creatorId, folderName]);

  const isMyFlashcards = creatorId === user?.id;
  const isFromFriend = !isMyFlashcards && creatorId && folderName;

  const handleStudy = () => {
    navigate('/study-folder', { 
      state: { 
        flashcards, 
        folderName: title,
        creatorName: subtitle
      } 
    });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">
              {title}
              <span className="text-sm text-muted-foreground ml-2">
                ({flashcards.length} cards)
              </span>
            </h3>
            {subtitle && (
              <span className="text-sm text-muted-foreground">
                {subtitle}
              </span>
            )}
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
          {isFromFriend && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
              className={`transition-colors ${isFavorited ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
            >
              <Star className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCards(!showCards)}
          >
            <Eye className="h-4 w-4" />
            Show Cards
          </Button>
          {isMyFlashcards && (
            <Button
              variant="ghost"
              size="sm"
            >
              <Edit className="h-4 w-4" />
              Modify
            </Button>
          )}
        </div>
      </div>

      <FolderContent
        flashcards={flashcards}
        showCards={showCards}
        showCreator={showCreator}
      />
    </Card>
  );
}