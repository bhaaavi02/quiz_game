
import { WordData, PlacedWord, CrosswordCell } from "../types";

const GRID_SIZE = 15;

export const buildGrid = (words: WordData[]): { grid: CrosswordCell[][], placedWords: PlacedWord[] } => {
  const grid: CrosswordCell[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      char: null,
      wordIndices: [],
      isBlack: true,
      userInput: '',
      isSolved: false
    }))
  );

  const placed: PlacedWord[] = [];
  const sortedWords = [...words].sort((a, b) => b.answer.length - a.answer.length);

  // Helper to check if a word can be placed
  const canPlace = (word: string, row: number, col: number, dir: 'ACROSS' | 'DOWN') => {
    if (dir === 'ACROSS') {
      if (col + word.length > GRID_SIZE) return false;
      for (let i = 0; i < word.length; i++) {
        const cell = grid[row][col + i];
        if (!cell.isBlack && cell.char !== word[i]) return false;
      }
    } else {
      if (row + word.length > GRID_SIZE) return false;
      for (let i = 0; i < word.length; i++) {
        const cell = grid[row + i][col];
        if (!cell.isBlack && cell.char !== word[i]) return false;
      }
    }
    return true;
  };

  // Simplified placement logic (best effort)
  for (const word of sortedWords) {
    let bestPlacement: any = null;

    // First word goes in the middle
    if (placed.length === 0) {
      bestPlacement = { row: Math.floor(GRID_SIZE / 2), col: Math.floor((GRID_SIZE - word.answer.length) / 2), dir: 'ACROSS' };
    } else {
      // Look for intersections
      search: for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          for (const dir of ['ACROSS', 'DOWN'] as const) {
            if (canPlace(word.answer, r, c, dir)) {
              // Priority: does it intersect?
              let intersections = 0;
              for (let i = 0; i < word.answer.length; i++) {
                const cell = dir === 'ACROSS' ? grid[r][c + i] : grid[r + i][c];
                if (!cell.isBlack) intersections++;
              }
              if (intersections > 0) {
                bestPlacement = { row: r, col: c, dir };
                break search;
              }
            }
          }
        }
      }
    }

    if (bestPlacement) {
      const { row, col, dir } = bestPlacement;
      const index = placed.length;
      placed.push({ ...word, row, col, direction: dir, isSolved: false });
      
      for (let i = 0; i < word.answer.length; i++) {
        const r = dir === 'ACROSS' ? row : row + i;
        const c = dir === 'ACROSS' ? col + i : col;
        grid[r][c].char = word.answer[i];
        grid[r][c].isBlack = false;
        grid[r][c].wordIndices.push(index);
      }
    }
  }

  return { grid, placedWords: placed };
};
