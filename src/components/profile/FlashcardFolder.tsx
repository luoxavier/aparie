import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { FolderActions } from "../flashcard/FolderActions";
import { FolderContent } from "./folder/FolderContent";
import { FolderInfo } from "./folder/FolderInfo";
import { FolderFavoriteButton } from "./folder/FolderFavoriteButton";
import { ModifyFolderDialog } from "./folder/ModifyFolderDialog";
import { useFavoriteFolder } from "@/hooks/useFavoriteFolder";
import { useStudyFolder } from "@/hooks/useStudyFolder";
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
  recipient_can_modify?: boolean;
}

interface FlashcardFolderProps {
  title: string;
  subtitle?: string;
  flashcards: Flashcard[];
  showCreator?: boolean;
  creatorId?: string;
  playlistName?: string;
  recipientCanModify?: boolean;
}

export function FlashcardFolder({ 
  title, 
  subtitle,
  flashcards, 
  showCreator = true,
  creatorId,
  playlistName,
  recipientCanModify = false,
}: FlashcardFolderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCards, setShowCards] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isFavorited, toggleFavorite } = useFavoriteFolder(user?.id, creatorId, playlistName);
  const { handleStudy } = useStudyFolder();

  const handleFolderClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.folder-main-area')) {
      handleStudy(flashcards, title, subtitle || user?.email);
    }
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    queryClient.invalidateQueries({ queryKey: ['favorite-folders'] });
    setIsDialogOpen(false);
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
      <div className="folder-main-area flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <FolderFavoriteButton
            isFavorited={isFavorited}
            onFavoriteClick={(e) => {
              e.stopPropagation();
              toggleFavorite(e);
            }}
          />
          <FolderInfo
            title={title}
            subtitle={subtitle}
            cardsCount={flashcards.length}
          />
        </div>

        <FolderActions
          isFavorited={isFavorited}
          onFavoriteClick={(e) => {
            e.stopPropagation();
            toggleFavorite(e);
          }}
          onStudyClick={(e) => {
            e.stopPropagation();
            handleStudy(flashcards, title, subtitle || user?.email);
          }}
          onEditClick={() => setIsDialogOpen(true)}
          onExpandClick={() => setShowCards(!showCards)}
          creatorId={creatorId}
          playlistName={playlistName}
          isExpanded={showCards}
          recipientCanModify={recipientCanModify}
        />
      </div>

      <ModifyFolderDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        userId={user?.id}
        flashcards={flashcards}
        playlistName={playlistName}
        onSave={handleEditSuccess}
      />

      <div 
        className={`mt-4 transition-all duration-300 ${showCards ? 'animate-accordion-down' : 'animate-accordion-up'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <FolderContent
          flashcards={flashcards}
          showCards={showCards}
          showCreator={showCreator}
        />
      </div>
    </Card>
  );
}