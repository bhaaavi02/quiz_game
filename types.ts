
export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT'
}

export interface WordData {
  answer: string;
  clue: string;
  category: string;
  hints: string[]; // [Subtle, Partial, Reveal Char]
}

export interface PlacedWord extends WordData {
  row: number;
  col: number;
  direction: 'ACROSS' | 'DOWN';
  isSolved: boolean;
}

export interface CrosswordCell {
  char: string | null;
  wordIndices: number[]; // Index into PlacedWord array
  isBlack: boolean;
  userInput: string;
  isSolved: boolean;
}

export interface UserProgress {
  xp: number;
  level: number;
  streak: number;
  completedPuzzles: number;
  unlockedCategories: string[];
}

export interface GameState {
  difficulty: Difficulty;
  grid: CrosswordCell[][];
  placedWords: PlacedWord[];
  currentWordIndex: number | null;
  status: 'LOADING' | 'PLAYING' | 'COMPLETED';
}
