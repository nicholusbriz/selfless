export const MAX_TRIVIA_LEVEL = 10;
export const MIN_ACCURACY_TO_LEVEL_UP = 70;

export function getDifficultyForLevel(
  level: number,
): 'beginner' | 'intermediate' | 'advanced' {
  if (level <= 2) return 'beginner';
  if (level <= 5) return 'intermediate';
  return 'advanced';
}

export function shouldResetCompletedTriviaLevel(
  currentLevel: number,
  completedAt: Date | null,
  currentDayStart: Date,
): boolean {
  return (
    currentLevel === MAX_TRIVIA_LEVEL &&
    completedAt !== null &&
    completedAt.getTime() < currentDayStart.getTime()
  );
}
