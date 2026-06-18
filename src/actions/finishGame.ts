'use server';

import { finishGameRecord } from "~/dal/queries";
import { GameStatus, IJigsawGame } from "~/types";

interface FinishGameInput {
  gameId: string;
  status: Extract<GameStatus, 'completed' | 'abandoned'>;
  gameState?: IJigsawGame;
}

export async function finishGameAction({ gameId, status, gameState }: FinishGameInput) {
  if (!gameId) {
    throw new Error('Game id is required');
  }

  return finishGameRecord(gameId, status, gameState);
}
