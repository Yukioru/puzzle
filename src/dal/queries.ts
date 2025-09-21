import { IJigsawGame } from "~/types";
import { getDimensions, shufflePieces, generateInitialPieces } from "~/utils";

export async function getGameById(id: string): Promise<IJigsawGame> {
  const difficulty = 'easy';
  const boardSize = getDimensions(difficulty);

  const initialPieces = generateInitialPieces(boardSize.rows, boardSize.cols);

  const { pieces, missedPieces } = shufflePieces(initialPieces, difficulty);

  return {
    id,
    difficulty,
    pieces,
    initialPieces,
    missedPieces,
  };
}