import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">Welcome to Flashcards</h1>
        <div className="flex flex-col gap-4">
          <Button 
            onClick={() => navigate("/create-flashcard")}
            className="w-full py-6 text-lg"
          >
            Create New Flashcard
          </Button>
          <Button 
            onClick={() => navigate("/study-folder")}
            variant="secondary"
            className="w-full py-6 text-lg"
          >
            Study Flashcards
          </Button>
        </div>
      </div>
    </div>
  );
}