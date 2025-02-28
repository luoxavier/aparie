
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { FolderActions } from "../flashcard/FolderActions";
import { FolderContent } from "./folder/FolderContent";
import { FolderInfo } from "./folder/FolderInfo";
import { FolderFavoriteButton } from "./folder/FolderFavoriteButton";
import { ModifyFolderDialog } from "./folder/ModifyFolderDialog";
import { useFavoriteFolder } from "@/hooks/useFavoriteFolder";
import { useToast } from "@/hooks/use-toast";
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
  recipient_can_modify?: boolean;
  is_public?: boolean;
}

interface FlashcardFolderProps {
  title: string;
  subtitle?: string;
  flashcards: Flashcard[];
  showCreator?: boolean;
  creatorId?: string;
  playlistName?: string;
  recipientCanModify?: boolean;
  onEditSuccess?: () => void;
}

export function FlashcardFolder({ 
  title, 
  subtitle,
  flashcards, 
  showCreator = true,
  creatorId,
  playlistName,
  recipientCanModify = false,
  onEditSuccess,
}: FlashcardFolderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCards, setShowCards] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const folderRef = useRef<HTMLDivElement>(null);
  const { isFavorited, toggleFavorite } = useFavoriteFolder(user?.id, creatorId, playlistName);

  const isPublic = flashcards.some(card => card.is_public);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (folderRef.current && !folderRef.current.contains(event.target as Node)) {
        setShowCards(false);
      }
    };

    if (showCards) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCards]);

  const handleFolderClick = (e: React.MouseEvent) => {
    // Make sure we're clicking on the folder itself and not a button
    if ((e.target as HTMLElement).closest('.folder-actions')) {
      return; // Don't navigate if clicking on action buttons
    }
    
    if (creatorId && playlistName) {
      // Navigate directly to the Study component with the correct state
      navigate(`/study`, {
        state: {
          flashcards: flashcards.map(card => ({
            id: card.id,
            front: card.front,
            back: card.back,
            creator_id: card.creator_id
          })),
          folderName: title,
          creatorName: subtitle || user?.email
        }
      });
    } else {
      // Log error for debugging
      console.error("Missing creatorId or playlistName", { creatorId, playlistName });
      toast({
        variant: "destructive",
        title: "Navigation Error",
        description: "Could not navigate to this playlist."
      });
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
    if (onEditSuccess) onEditSuccess();
  };

  return (
    <Card 
      ref={folderRef}
      className="p-4 hover:bg-accent/50 transition-colors cursor-pointer mb-3"
      onClick={handleFolderClick}
    >
      <div className="folder-main-area grid grid-cols-[auto_1fr_auto] gap-2">
        {/* Favorite button */}
        <div className="flex items-center">
          <FolderFavoriteButton
            isFavorited={isFavorited}
            onFavoriteClick={(e) => {
              e.stopPropagation();
              toggleFavorite(e);
            }}
          />
        </div>
        
        {/* Title and card count section */}
        <div className="min-w-0">
          <FolderInfo
            title={title}
            subtitle={showCreator ? subtitle : undefined}
            cardsCount={flashcards.length}
          />
        </div>

        {/* Actions section */}
        <div className="flex items-center folder-actions">
          <FolderActions
            isFavorited={isFavorited}
            onFavoriteClick={(e) => {
              e.stopPropagation();
              toggleFavorite(e);
            }}
            onStudyClick={(e) => {
              e.stopPropagation();
              if (creatorId && playlistName) {
                // Update Study button click to use the same navigation approach
                navigate(`/study`, {
                  state: {
                    flashcards: flashcards.map(card => ({
                      id: card.id,
                      front: card.front,
                      back: card.back,
                      creator_id: card.creator_id
                    })),
                    folderName: title,
                    creatorName: subtitle || user?.email
                  }
                });
              }
            }}
            onEditClick={(e) => {
              e.stopPropagation();
              setIsDialogOpen(true);
            }}
            onExpandClick={(e) => {
              e.stopPropagation();
              setShowCards(!showCards);
            }}
            creatorId={creatorId}
            playlistName={playlistName}
            isExpanded={showCards}
            recipientCanModify={recipientCanModify}
            isPublic={isPublic}
          />
        </div>
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
        className={`mt-4 overflow-hidden transition-all duration-300 ease-in-out ${
          showCards ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
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
