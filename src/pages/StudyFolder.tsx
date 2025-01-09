import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export default function StudyFolder() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { flashcards, folderName } = location.state || { flashcards: [], folderName: "Untitled" };
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [mistakes, setMistakes] = useState<Flashcard[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const handleAnswer = (selectedAnswer: string) => {
    const isCorrect = selectedAnswer === flashcards[currentCardIndex].back;
    
    if (!isCorrect && !mistakes.find(card => card.id === flashcards[currentCardIndex].id)) {
      setMistakes([...mistakes, flashcards[currentCardIndex]]);
    }
    
    toast({
      title: isCorrect ? "Correct! 🎉" : "Incorrect",
      description: isCorrect ? "Great job!" : `The correct answer was: ${flashcards[currentCardIndex].back}`,
      variant: isCorrect ? "default" : "destructive",
    });
    
    setTimeout(() => {
      setIsFlipped(false);
      if (currentCardIndex < flashcards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      }
    }, 1000);
  };

  const getOtherAnswers = () => {
    const currentAnswer = flashcards[currentCardIndex].back;
    return flashcards
      .filter(card => card.back !== currentAnswer)
      .map(card => card.back)
      .slice(0, 3);
  };

  const answers = [...getOtherAnswers(), flashcards[currentCardIndex].back]
    .sort(() => Math.random() - 0.5);

  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div className="text-lg font-medium">{user?.email}</div>
        <Button variant="ghost" onClick={() => navigate("/profile")}>
          log out
        </Button>
      </div>

      <h1 className="text-2xl font-bold text-center mb-8">{folderName}</h1>

      <div className="bg-gray-100 rounded-lg p-8 mb-8 min-h-[200px] flex items-center justify-center">
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          className="text-xl font-medium text-center"
        >
          {flashcards[currentCardIndex].front}
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {answers.map((answer, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto py-4 text-left"
            onClick={() => handleAnswer(answer)}
          >
            {answer}
          </Button>
        ))}
      </div>

      {mistakes.length > 0 && (
        <Button
          variant="outline"
          className="w-full mb-4"
          onClick={() => {
            // Handle reviewing mistakes
            toast({
              title: "Review Mistakes",
              description: `You have ${mistakes.length} cards to review`,
            });
          }}
        >
          review mistakes ({mistakes.length})
        </Button>
      )}

      <Button
        variant="outline"
        className="w-full"
        onClick={() => navigate("/profile")}
      >
        return home
      </Button>
    </div>
  );
}