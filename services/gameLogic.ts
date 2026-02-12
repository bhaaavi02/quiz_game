
import { WordData, PlacedWord, CrosswordCell } from "../types";

export const buildGrid = (words: WordData[], level: number): { grid: CrosswordCell[][], placedWords: PlacedWord[] } => {
  const gridSize = Math.min(10 + level, 20); // Grid grows with level
  
  const grid: CrosswordCell[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => ({
      char: null,
      wordIndices: [],
      isBlack: true,
      userInput: '',
      isSolved: false
    }))
  );

  const placed: PlacedWord[] = [];
  const sortedWords = [...words].sort((a, b) => b.answer.length - a.answer.length);

  const canPlace = (word: string, row: number, col: number, dir: 'ACROSS' | 'DOWN') => {
    if (dir === 'ACROSS') {
      if (col + word.length > gridSize) return false;
      for (let i = 0; i < word.length; i++) {
        const cell = grid[row][col + i];
        if (!cell.isBlack && cell.char !== word[i]) return false;
      }
    } else {
      if (row + word.length > gridSize) return false;
      for (let i = 0; i < word.length; i++) {
        const cell = grid[row + i][col];
        if (!cell.isBlack && cell.char !== word[i]) return false;
      }
    }
    return true;
  };

  for (const word of sortedWords) {
    let bestPlacement: any = null;

    if (placed.length === 0) {
      bestPlacement = { row: Math.floor(gridSize / 3), col: Math.floor((gridSize - word.answer.length) / 2), dir: 'ACROSS' };
    } else {
      search: for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          for (const dir of ['ACROSS', 'DOWN'] as const) {
            if (canPlace(word.answer, r, c, dir)) {
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
      placed.push({ ...word, row, col, direction: dir, isSolved: false, hintsUsed: 0 });
      
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
