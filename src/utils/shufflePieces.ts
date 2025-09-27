import { Difficulty, IJigsawPiece } from "~/types";
import { getDimensions } from "./getDimentions";
import { selectPiecesToRemove } from "./selectPiecesToRemove";

export async function shufflePieces(
  pieces: IJigsawPiece[],
  difficulty: Difficulty
): Promise<{ pieces: IJigsawPiece[], playablePieces: IJigsawPiece[] }> {
  const { initialMissing, rows, cols } = getDimensions(difficulty);
  
  const missingIndices = selectPiecesToRemove(rows, cols, initialMissing);
  
  const boardPieces: IJigsawPiece[] = [];
  const playablePieces: IJigsawPiece[] = [];
  
  pieces.forEach((piece, index) => {
    if (missingIndices.includes(index)) {
      boardPieces[index] = {
        id: piece.id,
        initialSides: [...piece.initialSides],
        imageUrl: piece.imageUrl,
        isEmpty: true,
      };
      playablePieces.push({
        ...piece,
        initialSides: [...piece.initialSides] as [number, number, number, number]
      });
    } else {
      boardPieces[index] = piece;
    }
  });
  
  for (const piece of playablePieces) {
    const rotations = Math.floor(Math.random() * 4);
    for (let i = 0; i < rotations; i++) {
      const [top, right, bottom, left] = piece.initialSides;
      piece.initialSides = [left, top, right, bottom];
    }
    if (rotations > 0) {
      piece.imageRotation = rotations * 90;
    }
  }
  
  for (let i = playablePieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [playablePieces[i], playablePieces[j]] = [playablePieces[j], playablePieces[i]];
  }
  
  return { pieces: boardPieces, playablePieces };
}