import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStudyFolder } from "@/hooks/useStudyFolder";
import { Link } from "react-router-dom";

interface FlashcardFolderProps {
  title: string;
  subtitle?: string;
  flashcards: any[];
  showCreator?: boolean;
  creatorId: string;
  playlistName: string;
}

export function FlashcardFolder({
  title,
  subtitle,
  flashcards,
  showCreator = false,
  creatorId,
  playlistName,
}: FlashcardFolderProps) {
  const { handleStudy } = useStudyFolder();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {showCreator ? (
            <Link to={`/profile/${creatorId}`} className="hover:underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStudy(flashcards, playlistName, creatorId)}
        >
          Study Now
        </Button>
      </CardHeader>
      <CardContent>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        <div className="text-2xl font-bold">{flashcards.length} cards</div>
      </CardContent>
    </Card>
  );
}