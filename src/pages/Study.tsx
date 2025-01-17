import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StudyMode } from "@/components/profile/StudyMode";
import { Home } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export default function Study() {
  const location = useLocation();
  const navigate = useNavigate();
  const { flashcards, folderName } = location.state || { 
    flashcards: [], 
    folderName: "Untitled"
  };

  const [selectedMode, setSelectedMode] = useState<"normal" | "infinite" | null>(null);

  if (!flashcards.length) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No flashcards found</h1>
          <Button onClick={() => navigate("/profile")}>Return to Profile</Button>
        </div>
      </div>
    );
  }

  if (!selectedMode) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">{folderName}</h1>
          <p className="text-sm text-muted-foreground mt-1">Created by user</p>
        </div>

        <div className="space-y-4">
          <Button 
            className="w-full h-24 text-xl"
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
          <Button
            variant="outline"
            onClick={() => navigate("/profile")}
            className="w-full mt-4 flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <StudyMode 
      deck={flashcards}
      onExit={() => navigate("/profile")}
    />
  );
}