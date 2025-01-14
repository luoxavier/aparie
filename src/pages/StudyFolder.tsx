import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { ScoreDisplay } from "@/components/study/ScoreDisplay";
import { FlashcardDisplay } from "@/components/study/FlashcardDisplay";
import { StudyProgress } from "@/components/study/StudyProgress";
import { Button } from "@/components/ui/button";
import { StudyControls } from "@/components/study/StudyControls";
import { Home } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

type StudyMode = "normal" | "infinite";

export default function StudyFolder() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { flashcards, folderName, creatorName } = location.state || { 
    flashcards: [], 
    folderName: "Untitled",
    creatorName: ""
  };
  
  const [mode, setMode] = useState<StudyMode | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [mistakes, setMistakes] = useState<Flashcard[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [infiniteCycles, setInfiniteCycles] = useState(0);
  const [perfectCycles, setPerfectCycles] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isReviewingMistakes, setIsReviewingMistakes] = useState(false);
  
  const currentDeck = isReviewingMistakes ? mistakes : flashcards;

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleAnswer = (selectedAnswer: string) => {
    const isCorrect = selectedAnswer === currentDeck[currentCardIndex].back;
    setIsCorrect(isCorrect);
    
    if (isCorrect) {
      setScore(score + 1);
    } else {
      if (!mistakes.find(card => card.id === currentDeck[currentCardIndex].id)) {
        setMistakes([...mistakes, currentDeck[currentCardIndex]]);
      }
      setShowAnswer(true);
    }
    
    setTimeout(() => {
      setIsCorrect(null);
      setShowAnswer(false);
      if (currentCardIndex < currentDeck.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        if (mode === "infinite") {
          if (mistakes.length === 0) {
            setPerfectCycles(perfectCycles + 1);
          } else {
            setPerfectCycles(0);
          }
          if (perfectCycles === 2) {
            setIsComplete(true);
          } else {
            setCurrentCardIndex(0);
            setInfiniteCycles(infiniteCycles + 1);
          }
        } else {
          setIsComplete(true);
        }
      }
    }, 1000);
  };

  const handleReviewMistakes = () => {
    setIsReviewingMistakes(true);
    setCurrentCardIndex(0);
    setScore(0);
    setIsComplete(false);
  };

  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      {/* Top bar with user info and sign out */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-lg font-medium">{user?.user_metadata?.username || user?.user_metadata?.display_name || user?.email?.split('@')[0]}</div>
        <Button variant="outline" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>

      {/* Folder title and creator */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{folderName}</h1>
        {creatorName && (
          <p className="text-sm text-muted-foreground mt-1">Created by {creatorName}</p>
        )}
      </div>

      {!mode ? (
        <div className="space-y-4">
          <Button 
            className="w-full h-24 text-xl"
            onClick={() => setMode("normal")}
          >
            Study Mode
          </Button>
          <Button 
            className="w-full h-24 text-xl"
            variant="secondary"
            onClick={() => setMode("infinite")}
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
      ) : isComplete ? (
        <ScoreDisplay
          score={score}
          totalCards={currentDeck.length}
          mistakes={mistakes}
          isReviewingMistakes={isReviewingMistakes}
          onReviewMistakes={handleReviewMistakes}
        />
      ) : (
        <>
          <FlashcardDisplay
            currentCard={currentDeck[currentCardIndex]}
            deck={currentDeck}
            isCorrect={isCorrect}
            showAnswer={showAnswer}
            onAnswer={handleAnswer}
            onReviewMistakes={handleReviewMistakes}
            streak={0}
            mistakes={mistakes}
          />
          <StudyProgress
            currentIndex={currentCardIndex}
            totalCards={currentDeck.length}
            mode={mode}
            infiniteCycles={infiniteCycles}
            perfectCycles={perfectCycles}
          />
          <StudyControls
            onExit={() => navigate("/profile")}
            onReviewMistakes={handleReviewMistakes}
            mistakesCount={mistakes.length}
            isReviewingMistakes={isReviewingMistakes}
          />
        </>
      )}
    </div>
  );
}