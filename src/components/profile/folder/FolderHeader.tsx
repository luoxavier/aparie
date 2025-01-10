import { Button } from "@/components/ui/button";
import { Star, ChevronDown } from "lucide-react";

export interface FolderHeaderProps {
  title: string;
  flashcardsCount: number;
  isMyFlashcards: boolean;
  isFromFriend: boolean;
  isFavorited: boolean;
  showCards: boolean;
  onToggleCards: () => void;
  onFavorite: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  folderName: string;
}

export function FolderHeader({
  title,
  flashcardsCount,
  isMyFlashcards,
  isFromFriend,
  isFavorited,
  showCards,
  onToggleCards,
  onFavorite,
  isExpanded,
  onToggleExpand,
  folderName,
}: FolderHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full pr-4">
      <span className="font-medium">
        {title}
        <span className="text-sm text-muted-foreground ml-2">
          ({flashcardsCount} cards)
        </span>
      </span>
      <div className="flex items-center gap-2">
        {isFromFriend && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onFavorite();
            }}
            className={`transition-colors ${isFavorited ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
          >
            <Star className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
        )}
        {!isMyFlashcards && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCards();
            }}
          >
            Show Cards
          </Button>
        )}
        <ChevronDown 
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
          onClick={onToggleExpand}
        />
      </div>
    </div>
  );
}