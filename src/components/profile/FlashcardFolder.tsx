import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Flashcard } from "@/types/flashcard";
import { FolderActions } from "./folder/FolderActions";
import { FolderHeader } from "./folder/FolderHeader";
import { FolderContent } from "./folder/FolderContent";

interface FlashcardFolderProps {
  folderName: string;
  flashcards: Flashcard[];
  onFlashcardsChange: (flashcards: Flashcard[]) => void;
}

export default function FlashcardFolder({
  folderName,
  flashcards,
  onFlashcardsChange,
}: FlashcardFolderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);

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
        folderName={folderName}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
      />

      {isExpanded && (
        <>
          <FolderContent
            flashcards={flashcards}
            onDeleteFlashcard={handleDeleteFlashcard}
          />
          <FolderActions
            onModifyFolder={handleModifyFolder}
            folderName={folderName}
          />
        </>
      )}

      <Dialog open={isModifyModalOpen} onOpenChange={setIsModifyModalOpen}>
        <DialogContent>
          <ModifyFolderDialog
            folderName={folderName}
            flashcards={flashcards}
            onSave={handleSaveModifications}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}