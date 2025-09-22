import { ReactNode } from "react";

export interface IJigsawPiece {
  id: string;
  sides: [number, number, number, number];
  image: string;
}

export interface IJigsawPieceWithRender extends IJigsawPiece {
  render?: ReactNode;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface IJigsawGame {
  id: string;
  difficulty: Difficulty;
  pieces: (IJigsawPiece | null)[];
  initialPieces: IJigsawPiece[];
  playablePieces: IJigsawPiece[];
}
