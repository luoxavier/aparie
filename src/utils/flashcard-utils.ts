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
  const options = [currentCard.back];
  
  // Get all unique answers from the deck
  const folderAnswers = [...new Set(deck.map(card => card.back))];
  
  // Remove the current card's answer from the pool
  const availableAnswers = folderAnswers.filter(answer => answer !== currentCard.back);
  
  // Prioritize mistakes if they exist
  const mistakeAnswers = mistakes
    .map(card => card.back)
    .filter(answer => answer !== currentCard.back);
  
  // Create a pool of wrong answers, prioritizing mistakes but ensuring variety
  let wrongAnswersPool = [
    ...new Set([
      ...mistakeAnswers,
      ...availableAnswers.sort(() => Math.random() - 0.5) // Randomize the available answers
    ])
  ];
  
  // If we have less than 4 total possible answers (including the correct one),
  // return all available unique answers
  if (wrongAnswersPool.length < 3) {
    const allUniqueAnswers = [...new Set([currentCard.back, ...wrongAnswersPool])];
    return allUniqueAnswers.sort(() => Math.random() - 0.5);
  }
  
  // Take exactly 3 wrong answers and combine with correct answer
  // Using slice to get a random subset of wrong answers
  const wrongAnswers = wrongAnswersPool
    .sort(() => Math.random() - 0.5) // Randomize again before slicing
    .slice(0, 3);
  
  // Combine correct answer with wrong answers and shuffle
  return [...options, ...wrongAnswers].sort(() => Math.random() - 0.5);
};