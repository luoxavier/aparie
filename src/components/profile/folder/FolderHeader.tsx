import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface FolderHeaderProps {
  title: string;
  subtitle?: string;
  isFavorited: boolean;
  onFavorite: (e: React.MouseEvent) => void;
  onStudy: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
}

export function FolderHeader({
  title,
  subtitle,
  isFavorited,
  onFavorite,
  onStudy,
  onEdit
}: FolderHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onFavorite}
          className={`transition-colors ${isFavorited ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'} p-0`}
        >
          <Star className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
        </Button>
        <div>
          <div className="flex items-baseline gap-1">
            <h3 className="text-base font-medium">
              {title}
            </h3>
            {subtitle && (
              <span className="text-xs text-muted-foreground">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={onStudy}
          className="h-7"
        >
          Study
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-7"
        >
          Edit
        </Button>
      </div>
    </div>
  );
}