import { Difficulty, IJigsawPiece } from "~/types";
import { getDimensions } from "./getDimentions";

export async function attachImageToPieces(
  filePath: string,
  pieces: Partial<IJigsawPiece>[],
  difficulty: Difficulty,
): Promise<IJigsawPiece[]> {
  const boardSize = getDimensions(difficulty);
  const fileName = filePath.split('/').pop()?.replace(/\.[^.]+$/, '') || '';
  return pieces.map((piece, index) => {
    const row = Math.floor(index / boardSize.cols) + 1;
    const col = (index % boardSize.cols) + 1;
    return {
      ...piece,
      imageUrl: `/pieces/${fileName}/${difficulty}/${row}-${col}.webp`
    } as IJigsawPiece;
  });
}