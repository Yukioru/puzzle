import { IJigsawPiece } from "~/types";

export function generateInitialPieces(rows: number, cols: number): Partial<IJigsawPiece>[] {
  const pieces: Partial<IJigsawPiece>[] = [];
  
  const sidesMatrix: number[][][] = [];
  
  for (let row = 0; row < rows; row++) {
    sidesMatrix[row] = [];
    for (let col = 0; col < cols; col++) {
      sidesMatrix[row][col] = [0, 0, 0, 0];
    }
  }
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (row === 0) {
        sidesMatrix[row][col][0] = 0;
      } else if (sidesMatrix[row - 1][col][2] === 0) {
        sidesMatrix[row][col][0] = 0;
      } else {
        sidesMatrix[row][col][0] = -sidesMatrix[row - 1][col][2];
      }
      
      if (col === cols - 1) {
        sidesMatrix[row][col][1] = 0;
      } else {
        sidesMatrix[row][col][1] = Math.random() > 0.5 ? 1 : -1;
      }
      
      if (row === rows - 1) {
        sidesMatrix[row][col][2] = 0;
      } else {
        sidesMatrix[row][col][2] = Math.random() > 0.5 ? 1 : -1;
      }
      
      if (col === 0) {
        sidesMatrix[row][col][3] = 0;
      } else {
        sidesMatrix[row][col][3] = -sidesMatrix[row][col - 1][1];
      }
    }
  }
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      pieces.push({
        id: `piece-${row}-${col}`,
        sides: sidesMatrix[row][col] as [number, number, number, number],
      });
    }
  }
  
  return pieces;
}