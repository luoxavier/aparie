import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [infiniteCycles, setInfiniteCycles] = useState(0);
  const [perfectCycles, setPerfectCycles] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isReviewingMistakes, setIsReviewingMistakes] = useState(false);
  
  const currentDeck = isReviewingMistakes ? mistakes : flashcards;
  
  const handleModeSelect = (selectedMode: StudyMode) => {
    setMode(selectedMode);
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (!mode) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-center mb-8">{folderName}</h1>
        <div className="space-y-4">
          <Button 
            className="w-full h-24 text-xl"
            onClick={() => handleModeSelect("normal")}
          >
            Study Mode
          </Button>
          <Button 
            className="w-full h-24 text-xl"
            variant="secondary"
            onClick={() => handleModeSelect("infinite")}
          >
            Infinite Mode
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div className="text-lg font-medium">{user?.email}</div>
        <Button variant="ghost" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>

      <h1 className="text-2xl font-bold text-center mb-8">{folderName}</h1>

      {isComplete ? (
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Score: {score}/{currentDeck.length}
          </h2>
          {mistakes.length > 0 && !isReviewingMistakes && (
            <Button 
              onClick={handleReviewMistakes}
              className="w-full"
            >
              Review Mistakes ({mistakes.length})
            </Button>
          )}
          {(mistakes.length === 0 || isReviewingMistakes) && (
            <div className="space-y-4">
              <h3 className="text-2xl">🎉 Congratulations!</h3>
              <Button 
                onClick={() => navigate("/profile")}
                className="w-full"
              >
                Back to Main Menu
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCardIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "bg-white rounded-lg p-8 min-h-[200px] flex flex-col items-center justify-center relative",
                isCorrect === true && "animate-[sparkle_1s_ease-in-out]",
                isCorrect === false && "animate-[glow-red_1s_ease-in-out]"
              )}
              onClick={() => {
                if (showAnswer) {
                  handleAnswer(currentDeck[currentCardIndex].back);
                }
              }}
            >
              <p className="text-xl font-medium text-center">
                {currentDeck[currentCardIndex].front}
              </p>
              {showAnswer && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg text-red-500 mt-4"
                >
                  Answer: {currentDeck[currentCardIndex].back}
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-4">
            {!showAnswer && currentDeck.map((card, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-4 text-left"
                onClick={() => handleAnswer(card.back)}
              >
                {card.back}
              </Button>
            )).sort(() => Math.random() - 0.5).slice(0, 4)}
          </div>

          <div className="text-center text-gray-600">
            Card {currentCardIndex + 1} of {currentDeck.length}
            {mode === "infinite" && (
              <div>Cycle {infiniteCycles + 1} - Perfect Cycles: {perfectCycles}/3</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}