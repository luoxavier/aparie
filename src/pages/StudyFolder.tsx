import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { StudyModeSelector } from "@/components/study/StudyModeSelector";
import { StudyHeader } from "@/components/study/StudyHeader";
import { ScoreDisplay } from "@/components/study/ScoreDisplay";
import { FlashcardDisplay } from "@/components/study/FlashcardDisplay";
import { StudyProgress } from "@/components/study/StudyProgress";

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
  const { flashcards, folderName } = location.state || { flashcards: [], folderName: "Untitled" };
  
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
  const [needsReview, setNeedsReview] = useState<Set<number>>(new Set());
  
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
      // Remove from review if it was there
      const newNeedsReview = new Set(needsReview);
      newNeedsReview.delete(currentCardIndex);
      setNeedsReview(newNeedsReview);
    } else {
      if (!mistakes.find(card => card.id === currentDeck[currentCardIndex].id)) {
        setMistakes([...mistakes, currentDeck[currentCardIndex]]);
      }
      // Add to review set
      setNeedsReview(new Set(needsReview).add(currentCardIndex));
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
          // For Study Mode, only complete if there are no cards that need review
          if (needsReview.size === 0) {
            setIsComplete(true);
          } else {
            // Reset to beginning to review mistakes
            setCurrentCardIndex(0);
            setScore(0);
          }
        }
      }
    }, 1000);
  };

  const handleReviewMistakes = () => {
    setIsReviewingMistakes(true);
    setCurrentCardIndex(0);
    setScore(0);
    setIsComplete(false);
    setNeedsReview(new Set());
  };

  if (!mode) {
    return <StudyModeSelector onModeSelect={setMode} folderName={folderName} />;
  }

  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <StudyHeader 
        userEmail={user?.email} 
        onSignOut={handleSignOut}
        folderName={folderName}
      />

      {isComplete ? (
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
          />
          <StudyProgress
            currentIndex={currentCardIndex}
            totalCards={currentDeck.length}
            mode={mode}
            infiniteCycles={infiniteCycles}
            perfectCycles={perfectCycles}
          />
        </>
      )}
    </div>
  );
}