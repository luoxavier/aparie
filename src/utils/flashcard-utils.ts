interface Flashcard {
  front: string;
  back: string;
}

export const generateAnswerOptions = (
  currentCard: Flashcard,
  deck: Flashcard[],
  mistakes: Flashcard[] = []
) => {
  // Always include the correct answer
  const correctAnswer = currentCard.back;
  
  // Get all unique answers from the deck excluding the current card's answer
  const allPossibleAnswers = [...new Set(
    deck
      .filter(card => card.back !== correctAnswer)
      .map(card => card.back)
  )];
  
  // Get unique mistake answers excluding the current card's answer
  const mistakeAnswers = [...new Set(
    mistakes
      .map(card => card.back)
      .filter(answer => answer !== correctAnswer)
  )];
  
  // If we have less than 3 other possible answers total, return all available answers
  if (allPossibleAnswers.length < 3) {
    return [...new Set([correctAnswer, ...allPossibleAnswers])]
      .sort(() => Math.random() - 0.5);
  }
  
  // Create a pool of wrong answers, prioritizing mistakes
  const wrongAnswersPool = [
    ...mistakeAnswers,
    ...allPossibleAnswers.filter(answer => !mistakeAnswers.includes(answer))
  ];
  
  // Randomly select 3 wrong answers
  const selectedWrongAnswers = wrongAnswersPool
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  
  // Combine with correct answer and shuffle again
  return [correctAnswer, ...selectedWrongAnswers]
    .sort(() => Math.random() - 0.5);
};