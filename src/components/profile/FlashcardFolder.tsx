import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Flashcard } from "@/types/flashcard";
import { FolderActions } from "./folder/FolderActions";
import { FolderHeader } from "./folder/FolderHeader";
import { FolderContent } from "./folder/FolderContent";
import { ModifyFolderDialog } from "./folder/ModifyFolderDialog";

interface FlashcardFolderProps {
  folderName: string;
  subtitle?: string;
  flashcards: Flashcard[];
  onFlashcardsChange: (flashcards: Flashcard[]) => void;
  isMyFlashcards?: boolean;
  isFromFriend?: boolean;
  showCreator?: boolean;
  creatorId?: string;
  onStudy?: () => void;
}

export default function FlashcardFolder({
  folderName,
  subtitle,
  flashcards,
  onFlashcardsChange,
  isMyFlashcards = false,
  isFromFriend = false,
  showCreator = true,
  creatorId,
  onStudy,
}: FlashcardFolderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [showCards, setShowCards] = useState(false);

  const handleDeleteFlashcard = (flashcardId: string) => {
    const updatedFlashcards = flashcards.filter((f) => f.id !== flashcardId);
    onFlashcardsChange(updatedFlashcards);
  };

  const handleModifyFolder = () => {
    setIsModifyModalOpen(true);
  };

  const handleSaveModifications = () => {
    setIsModifyModalOpen(false);
  };

  return (
    <Card className="p-4">
      <FolderHeader
        title={folderName}
        subtitle={subtitle}
        flashcardsCount={flashcards.length}
        isMyFlashcards={isMyFlashcards}
        isFromFriend={isFromFriend}
        isFavorited={false}
        showCards={showCards}
        onToggleCards={() => setShowCards(!showCards)}
        onFavorite={() => {}}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
      />

      {isExpanded && (
        <>
          <FolderContent
            flashcards={flashcards}
            showCards={showCards}
            showCreator={showCreator}
            onDeleteFlashcard={handleDeleteFlashcard}
          />
          <FolderActions
            isMyFlashcards={isMyFlashcards}
            isFromFriend={isFromFriend}
            flashcards={flashcards}
            userId={creatorId}
            folderName={folderName}
            onStudy={onStudy}
            onModifyFolder={handleModifyFolder}
          />
        </>
      )}

      <ModifyFolderDialog
        isOpen={isModifyModalOpen}
        onOpenChange={setIsModifyModalOpen}
        userId={creatorId}
        flashcards={flashcards}
        folderName={folderName}
        onSave={handleSaveModifications}
      />
    </Card>
  );
}