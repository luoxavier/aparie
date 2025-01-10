import { Button } from "@/components/ui/button";
import { Heart, Pencil, Play } from "lucide-react";

interface FolderHeaderProps {
  title: string;
  subtitle?: string;
  isFavorited?: boolean;
  onFavorite?: (e: React.MouseEvent) => void;
  onStudy?: (e: React.MouseEvent) => void;
  onEdit?: (e: React.MouseEvent) => void;
  cardCount?: number;
}

export function FolderHeader({
  title,
  subtitle,
  isFavorited,
  onFavorite,
  onStudy,
  onEdit,
  cardCount
}: FolderHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {cardCount !== undefined && (
            <span className="text-sm text-muted-foreground">
              ({cardCount} card{cardCount !== 1 ? 's' : ''})
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onFavorite && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onFavorite}
            className="hover:bg-background"
          >
            <Heart
              className={`h-4 w-4 ${
                isFavorited ? "fill-primary text-primary" : "text-muted-foreground"
              }`}
            />
          </Button>
        )}
        {onStudy && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onStudy}
            className="hover:bg-background"
          >
            <Play className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="hover:bg-background"
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  );
}