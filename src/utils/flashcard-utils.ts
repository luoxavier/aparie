interface Flashcard {
  front: string;
  back: string;
}

export const generateAnswerOptions = (
  currentCard: Flashcard,
  deck: Flashcard[],
  mistakes: Flashcard[] = []
) => {
  // Get the correct answer
  const correctAnswer = currentCard.back;
  
  // Get all possible wrong answers from the deck (excluding current card's answer)
  const wrongAnswers = deck
    .filter(card => card.back !== correctAnswer)
    .map(card => card.back);
  
  // If we don't have enough wrong answers, return all unique answers
  if (wrongAnswers.length < 3) {
    return [...new Set([correctAnswer, ...wrongAnswers])]
      .sort(() => Math.random() - 0.5);
  }
  
  // Shuffle wrong answers and take 3
  const selectedWrongAnswers = [...wrongAnswers]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  
  // Combine with correct answer and shuffle again
  return [correctAnswer, ...selectedWrongAnswers]
    .sort(() => Math.random() - 0.5);
};