import { Button } from "@/components/ui/button";
import { Heart, Edit } from "lucide-react";

interface FolderActionsProps {
  isFavorited: boolean;
  onFavoriteClick: (e: React.MouseEvent) => void;
  onStudyClick: (e: React.MouseEvent) => void;
  onEditClick: (e: React.MouseEvent) => void;
}

export function FolderActions({ isFavorited, onFavoriteClick, onStudyClick, onEditClick }: FolderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onFavoriteClick}
        className={`transition-colors ${isFavorited ? 'text-primary' : 'text-gray-400 hover:text-primary'} p-0`}
      >
        <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={onStudyClick}
        className="h-8"
      >
        Study
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onEditClick}
        className="h-8"
      >
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  );
}