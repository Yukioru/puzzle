import { Over } from "@dnd-kit/core";
import { ReactNode } from "react";

export interface IJigsawPiece {
  id: string;
  initialSides: [number, number, number, number];
  currentSides?: [number, number, number, number];
  imageUrl: string;
  imageRotation?: number;
  isMissed?: boolean;
  isComplete?: boolean;
  isEmpty?: boolean;
  isOnBoard?: boolean;
  isMatches?: boolean;
  coords?: {
    x: number;
    y: number;
  };
  cellOver?: Over | null;
}

export interface IJigsawPieceWithRender extends IJigsawPiece {
  render?: ReactNode;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface IJigsawGame {
  id: string;
  imageFileName: string;
  difficulty: Difficulty;
  pieces: IJigsawPiece[];
  initialPieces: IJigsawPiece[];
  playablePieces: IJigsawPiece[];
}
