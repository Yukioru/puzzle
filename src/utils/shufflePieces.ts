import { Difficulty, IJigsawPiece } from "~/types";
import { getDimensions } from "./getDimentions";
import { selectPiecesToRemove } from "./selectPiecesToRemove";
import sharp from "sharp";

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
        image: piece.image,
        isEmpty: true,
      };
      // Создаем глубокую копию паззла для playablePieces
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
    
    if (rotations > 0 && piece.image) {
      const imageData = piece.image.split(',')[1];
      const buffer = Buffer.from(imageData, 'base64');
      
      const rotatedBuffer = await sharp(buffer)
        .rotate(rotations * 90)
        .jpeg()
        .toBuffer();
        
      piece.image = `data:image/jpeg;base64,${rotatedBuffer.toString('base64')}`;
    }
  }
  
  for (let i = playablePieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [playablePieces[i], playablePieces[j]] = [playablePieces[j], playablePieces[i]];
  }
  
  return { pieces: boardPieces, playablePieces };
}