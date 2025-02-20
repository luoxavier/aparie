import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StudyMode } from "@/components/profile/StudyMode";
import { Home } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  creator_id?: string;
  playlist_name?: string;
}

export default function Study() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { flashcards, folderName, creatorName } = location.state || { 
    flashcards: [], 
    folderName: "Untitled",
    creatorName: "Unknown"
  };

  const [selectedMode, setSelectedMode] = useState<"normal" | "infinite" | "mastery" | null>(null);

  const handleHomeClick = () => {
    navigate("/");
  };

  if (!flashcards?.length) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No flashcards found</h1>
          <Button onClick={handleHomeClick}>Return to Profile</Button>
        </div>
      </div>
    );
  }

  if (!selectedMode) {
    return (
      <PageContainer>
        <div className="container mx-auto py-6 px-4 sm:px-6">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">{folderName}</h1>
              <p className="text-sm text-muted-foreground mt-1">{creatorName}</p>
            </div>

            <div className="space-y-4">
              <Button 
                className="w-full h-16 text-lg"
                onClick={() => setSelectedMode("normal")}
              >
                Study Mode
              </Button>
              <Button 
                className="w-full h-16 text-lg"
                variant="secondary"
                onClick={() => setSelectedMode("infinite")}
              >
                Infinite Mode
              </Button>
              <Button 
                className="w-full h-16 text-lg"
                variant="default"
                onClick={() => setSelectedMode("mastery")}
              >
                Mastery Mode
              </Button>
              <Button
                variant="outline"
                onClick={handleHomeClick}
                className="w-full mt-4 flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                Return Home
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="container mx-auto max-w-2xl py-6 px-4 sm:px-6">
        <StudyMode 
          deck={flashcards}
          onExit={() => setSelectedMode(null)}
          mode={selectedMode}
        />
      </div>
    </PageContainer>
  );
}
