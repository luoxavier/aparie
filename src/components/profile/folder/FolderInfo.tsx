import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FolderInfoProps {
  title: string;
  subtitle?: string;
  flashcardsCount: number;
  showCards: boolean;
  onToggleCards: () => void;
}

export function FolderInfo({
  title,
  subtitle,
  flashcardsCount,
  showCards,
  onToggleCards,
}: FolderInfoProps) {
  return (
    <div className="flex items-center gap-2">
      <div>
        <h3 className="font-semibold">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
        <p className="text-sm text-muted-foreground">
          {flashcardsCount} card{flashcardsCount !== 1 ? "s" : ""}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleCards}
        className="shrink-0"
      >
        {showCards ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}