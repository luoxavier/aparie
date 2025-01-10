import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface FolderActionsProps {
  isFavorited: boolean;
  onFavoriteClick: (e: React.MouseEvent) => void;
  onStudyClick: (e: React.MouseEvent) => void;
  onEditClick: (e: React.MouseEvent) => void;
}

export function FolderActions({ onStudyClick, onEditClick }: FolderActionsProps) {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent folder from collapsing
    onEditClick(e);
  };

  const handleStudyClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent folder from collapsing
    onStudyClick(e);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="default"
        size="sm"
        onClick={handleStudyClick}
        className="h-8"
      >
        Study
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleEditClick}
        className="h-8"
      >
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  );
}