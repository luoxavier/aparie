import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface FolderFavoriteButtonProps {
  isFavorited: boolean;
  onFavoriteClick: (e: React.MouseEvent) => void;
}

export function FolderFavoriteButton({ isFavorited, onFavoriteClick }: FolderFavoriteButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onFavoriteClick}
      className={`transition-colors ${isFavorited ? 'text-primary' : 'text-gray-400'} p-0`}
    >
      <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
    </Button>
  );
}