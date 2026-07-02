import { Difficulty, IJigsawPiece } from "~/types";
import { getDimensions } from "./getDimentions";

export async function attachImageToPieces(
  boardId: string,
  pieces: Partial<IJigsawPiece>[],
  difficulty: Difficulty,
): Promise<IJigsawPiece[]> {
  const boardSize = getDimensions(difficulty);
  return pieces.map((piece, index) => {
    const row = Math.floor(index / boardSize.cols) + 1;
    const col = (index % boardSize.cols) + 1;
    return {
      ...piece,
      imageUrl: `/pieces/${boardId}/${difficulty}/${row}-${col}.webp`
    } as IJigsawPiece;
  });
}
