import { Difficulty, IJigsawPiece } from "./types";

export function getDimensions(difficulty: Difficulty) {
  switch (difficulty) {
    case 'hard':
      return { rows: 6, cols: 8, initialMissing: 10 };
    case 'medium':
      return { rows: 5, cols: 7, initialMissing: 8 };
    case 'easy':
    default:
      return { rows: 4, cols: 6, initialMissing: 6 };
  }
}

function selectPiecesToRemove(rows: number, cols: number, count: number): number[] {
  const getNeighbors = (index: number): number[] => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const neighbors: number[] = [];
    
    if (row > 0) neighbors.push((row - 1) * cols + col);
    if (row < rows - 1) neighbors.push((row + 1) * cols + col);
    if (col > 0) neighbors.push(row * cols + (col - 1));
    if (col < cols - 1) neighbors.push(row * cols + (col + 1));
    
    return neighbors;
  };
  
  const candidates: number[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;
      const isCorner = (row === 0 || row === rows - 1) && (col === 0 || col === cols - 1);
      
      if (!isCorner) {
        candidates.push(index);
      }
    }
  }
  
  const startIndex = candidates[Math.floor(Math.random() * candidates.length)];
  
  const selected = new Set<number>([startIndex]);
  const queue = [startIndex];
  
  while (selected.size < count && queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = getNeighbors(current);
    
    for (let i = neighbors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
    }
    
    for (const neighbor of neighbors) {
      if (selected.size >= count) break;
      
      const neighborRow = Math.floor(neighbor / cols);
      const neighborCol = neighbor % cols;
      const isCorner = (neighborRow === 0 || neighborRow === rows - 1) && 
                      (neighborCol === 0 || neighborCol === cols - 1);
      
      if (!isCorner && !selected.has(neighbor)) {
        selected.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  
  return Array.from(selected);
}

export function shufflePieces(pieces: IJigsawPiece[], difficulty: Difficulty): { pieces: (IJigsawPiece | null)[], playablePieces: IJigsawPiece[] } {
  const { initialMissing, rows, cols } = getDimensions(difficulty);
  
  const missingIndices = selectPiecesToRemove(rows, cols, initialMissing);
  
  const boardPieces: (IJigsawPiece | null)[] = [];
  const playablePieces: IJigsawPiece[] = [];
  
  pieces.forEach((piece, index) => {
    if (missingIndices.includes(index)) {
      boardPieces[index] = null;
      playablePieces.push(piece);
    } else {
      boardPieces[index] = piece;
    }
  });
  
  // Поворачиваем каждый пропущенный элемент на случайный угол
  playablePieces.forEach(piece => {
    const rotations = Math.floor(Math.random() * 4); // 0, 1, 2, или 3 поворота на 90°
    
    // Поворачиваем sides: при повороте на 90° по часовой стрелке sides сдвигаются влево
    for (let i = 0; i < rotations; i++) {
      const [top, right, bottom, left] = piece.sides;
      piece.sides = [left, top, right, bottom];
    }
  });
  
  // Перемешиваем сами элементы для дополнительной рандомизации
  for (let i = playablePieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [playablePieces[i], playablePieces[j]] = [playablePieces[j], playablePieces[i]];
  }
  
  return { pieces: boardPieces, playablePieces };
}

export function generateInitialPieces(rows: number, cols: number): IJigsawPiece[] {
  const pieces: IJigsawPiece[] = [];
  
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
        sides: sidesMatrix[row][col] as [number, number, number, number]
      });
    }
  }
  
  return pieces;
}