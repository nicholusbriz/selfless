export function shuffleArray<T>(
  values: readonly T[],
  random = Math.random,
): T[] {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled;
}

export function randomizeTriviaOptions(
  options: readonly string[],
  correctAnswer: number,
  random = Math.random,
) {
  const optionIndexes = shuffleArray(
    options.map((_, index) => index),
    random,
  );

  return {
    options: optionIndexes.map((index) => options[index]),
    correctAnswer: optionIndexes.indexOf(correctAnswer),
    optionIndexes,
  };
}

export function selectTriviaQuestions<T extends { id: string }>(
  questions: readonly T[],
  recentlyUsedQuestionIds: ReadonlySet<string>,
  limit: number,
  random = Math.random,
): T[] {
  const freshQuestions = questions.filter(
    (question) => !recentlyUsedQuestionIds.has(question.id),
  );
  if (freshQuestions.length >= limit) {
    return shuffleArray(freshQuestions, random).slice(0, limit);
  }

  const previouslyUsedQuestions = questions.filter((question) =>
    recentlyUsedQuestionIds.has(question.id),
  );
  const candidates = [
    ...shuffleArray(freshQuestions, random),
    ...shuffleArray(previouslyUsedQuestions, random),
  ];

  return candidates.slice(0, Math.min(limit, candidates.length));
}
