import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { StudyMode } from "@/components/profile/StudyMode";
import { ReturnHomeButton } from "@/components/ReturnHomeButton";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  creator_id: string;
}

type StudyMode = "normal" | "infinite" | null;

export default function StudyFolder() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { flashcards, folderName, creatorName } = location.state || { 
    flashcards: [], 
    folderName: "Untitled",
    creatorName: ""
  };

  const [selectedMode, setSelectedMode] = useState<StudyMode>(null);

  if (!flashcards.length) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No flashcards found</h1>
          <ReturnHomeButton />
        </div>
      </div>
    );
  }

  if (!selectedMode) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">{folderName}</h1>
          {creatorName && (
            <p className="text-sm text-muted-foreground mt-1">Created by {creatorName}</p>
          )}
        </div>

        <div className="space-y-4">
          <Button 
            className="w-full h-24 text-xl bg-primary hover:bg-primary/90"
            onClick={() => setSelectedMode("normal")}
          >
            Study Mode
          </Button>
          <Button 
            className="w-full h-24 text-xl"
            variant="secondary"
            onClick={() => setSelectedMode("infinite")}
          >
            Infinite Mode
          </Button>
        </div>

        <div className="mt-8">
          <Button
            variant="outline"
            onClick={() => navigate("/profile")}
            className="w-full flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{folderName}</h1>
        {creatorName && (
          <p className="text-sm text-muted-foreground mt-1">Created by {creatorName}</p>
        )}
      </div>

      <StudyMode 
        deck={flashcards}
        onExit={() => setSelectedMode(null)}
        mode={selectedMode}
      />
    </div>
  );
}