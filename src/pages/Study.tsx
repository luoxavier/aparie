
import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StudyMode } from "@/components/profile/StudyMode";
import { Home, BookOpen, Zap, GraduationCap } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { useToast } from "@/hooks/use-toast";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  creator_id: string; // Changed from optional to required
  playlist_name?: string;
}

export default function Study() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { toast } = useToast();
  
  // Get data from location state if available
  const stateFlashcards = location.state?.flashcards;
  const stateFolderName = location.state?.folderName;
  const stateCreatorName = location.state?.creatorName;
  
  // Use state or default values
  const [flashcards, setFlashcards] = useState<Flashcard[]>(stateFlashcards || []);
  const [folderName, setFolderName] = useState(stateFolderName || "Untitled");
  const [creatorName, setCreatorName] = useState(stateCreatorName || "Unknown");
  const [selectedMode, setSelectedMode] = useState<"normal" | "infinite" | "mastery" | null>(null);

  // If we don't have flashcards in state, we need to fetch them
  useEffect(() => {
    // Only run this if we don't have flashcards already and we have the necessary params
    if (flashcards.length === 0 && params.creatorId && params.playlistName) {
      console.log("Flashcards not found in state, fetching from server...");
      // This is where you would fetch flashcards from your API
      // For now, we'll just show an error
      toast({
        variant: "destructive",
        title: "Error Loading Flashcards",
        description: "Please try accessing this playlist from your dashboard.",
      });
    }
  }, [params, flashcards.length, toast]);

  const handleHomeClick = () => {
    navigate("/");
  };

  if (!flashcards?.length) {
    return (
      <PageContainer>
        <div className="container max-w-md mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No flashcards found</h1>
            <p className="text-gray-500 mb-6">
              We couldn't find any flashcards for this playlist. This may happen if you accessed this page directly.
            </p>
            <Button onClick={handleHomeClick}>Return to Home</Button>
          </div>
        </div>
      </PageContainer>
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
                className="w-full h-16 text-lg flex items-center gap-3 justify-center"
                onClick={() => setSelectedMode("normal")}
              >
                <BookOpen className="h-5 w-5" />
                Study Mode
              </Button>
              <Button 
                className="w-full h-16 text-lg flex items-center gap-3 justify-center"
                variant="secondary"
                onClick={() => setSelectedMode("infinite")}
              >
                <Zap className="h-5 w-5" />
                Infinite Mode
              </Button>
              <Button 
                className="w-full h-16 text-lg flex items-center gap-3 justify-center"
                variant="default"
                onClick={() => setSelectedMode("mastery")}
              >
                <GraduationCap className="h-5 w-5" />
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
