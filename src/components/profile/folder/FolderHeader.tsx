import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FolderFavoriteButton } from "./FolderFavoriteButton";
import { FolderInfo } from "./FolderInfo";

export interface FolderHeaderProps {
  title: string;
  subtitle?: string;
  flashcardsCount: number;
  isMyFlashcards: boolean;
  isFromFriend: boolean;
  isFavorited: boolean;
  showCards: boolean;
  onToggleCards: () => void;
  onFavorite: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function FolderHeader({
  title,
  subtitle,
  flashcardsCount,
  isMyFlashcards,
  isFromFriend,
  isFavorited,
  showCards,
  onToggleCards,
  onFavorite,
  isExpanded,
  onToggleExpand,
}: FolderHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <FolderInfo
          title={title}
          subtitle={subtitle}
          flashcardsCount={flashcardsCount}
          showCards={showCards}
          onToggleCards={onToggleCards}
        />
      </div>
      <div className="flex items-center gap-2">
        {!isMyFlashcards && !isFromFriend && (
          <FolderFavoriteButton
            isFavorited={isFavorited}
            onFavoriteClick={onFavorite}
          />
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleExpand}
          className="shrink-0"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}