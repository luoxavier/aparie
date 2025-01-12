import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStudyFolder } from "@/hooks/useStudyFolder";
import { FolderActions } from "../flashcard/FolderActions";
import { FolderContent } from "./folder/FolderContent";
import { ModifyFolderDialog } from "./folder/ModifyFolderDialog";
import { FolderHeader } from "../flashcard/FolderHeader";
import { FolderFavoriteButton } from "./folder/FolderFavoriteButton";
import { FolderInfo } from "./folder/FolderInfo";

interface FlashcardFolderProps {
  title: string;
  subtitle?: string;
  flashcards: any[];
  creatorId?: string;
  playlistName?: string;
  isFavorited?: boolean;
  onFavoriteToggle?: () => void;
}

export function FlashcardFolder({
  title,
  subtitle,
  flashcards,
  creatorId,
  playlistName,
  isFavorited,
  onFavoriteToggle,
}: FlashcardFolderProps) {
  const [showCards, setShowCards] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { handleStudy } = useStudyFolder();

  const handleFolderClick = () => {
    handleStudy(null, flashcards, title, subtitle || user?.email);
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCards(!showCards);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsDialogOpen(false);
  };

  return (
    <div 
      className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md"
      onClick={handleFolderClick}
    >
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <FolderFavoriteButton
            isFavorited={isFavorited}
            onClick={toggleFavorite}
          />
          <FolderInfo
            title={title}
            subtitle={subtitle}
            flashcardCount={flashcards.length}
          />
        </div>
        <FolderActions
          isFavorited={isFavorited}
          onFavoriteClick={toggleFavorite}
          onStudyClick={handleFolderClick}
          onEditClick={handleEditClick}
          onExpandClick={handleExpandClick}
          creatorId={creatorId}
          playlistName={playlistName}
          isExpanded={showCards}
        />
      </div>

      <ModifyFolderDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        flashcards={flashcards}
        playlistName={playlistName}
        onSave={handleEditSuccess}
      />

      <div 
        className={`overflow-hidden transition-all duration-300 ${
          showCards 
            ? 'max-h-[500px] animate-accordion-down' 
            : 'max-h-0 animate-accordion-up'
        }`}
      >
        <FolderContent
          flashcards={flashcards}
          showCards={showCards}
        />
      </div>
    </div>
  );
}