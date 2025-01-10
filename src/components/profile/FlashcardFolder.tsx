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
import { Flashcard } from "@/types/database";

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
  showCreator = true,
  creatorId,
  folderName,
}: FlashcardFolderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCards, setShowCards] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isFavorited, toggleFavorite } = useFavoriteFolder(user?.id, creatorId, folderName);
  const { handleStudy } = useStudyFolder();

  const handleFolderClick = () => {
    setShowCards(!showCards);
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Flashcards updated successfully",
    });
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  const handleStudyClick = (e: React.MouseEvent) => {
    handleStudy(e, flashcards, title, subtitle || user?.email);
  };

  return (
    <Card 
      className="p-4 hover:bg-accent/50 transition-colors cursor-pointer mb-3"
      onClick={handleFolderClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <FolderFavoriteButton
            isFavorited={isFavorited}
            onFavoriteClick={toggleFavorite}
          />
          <FolderInfo
            title={title}
            subtitle={subtitle}
            cardsCount={flashcards.length}
          />
        </div>

        <FolderActions
          isFavorited={isFavorited}
          onFavoriteClick={toggleFavorite}
          onStudyClick={handleStudyClick}
          onEditClick={handleEditClick}
        />
      </div>

      <ModifyFolderDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        userId={user?.id}
        flashcards={flashcards}
        folderName={folderName}
        onSave={handleEditSuccess}
      />

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
