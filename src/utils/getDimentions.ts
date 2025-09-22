import { Difficulty } from "~/types";

export function getDimensions(difficulty: Difficulty) {
  switch (difficulty) {
    case 'hard':
      return { rows: 6, cols: 9, initialMissing: 10 };
    case 'medium':
      return { rows: 5, cols: 8, initialMissing: 8 };
    case 'easy':
    default:
      return { rows: 4, cols: 6, initialMissing: 6 };
  }
}