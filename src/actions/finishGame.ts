'use server';

import {
  completeEnduranceRound,
  finishGameRecord,
  prepareEnduranceNextRound,
  resumeEnduranceGame,
} from "~/dal/queries";
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

export async function completeEnduranceRoundAction(
  gameId: string,
  gameState: IJigsawGame,
  options?: { nextGamePreloaded?: boolean }
) {
  if (!gameId) {
    throw new Error('Game id is required');
  }

  return completeEnduranceRound(gameId, gameState, options);
}

export async function prepareEnduranceNextRoundAction(gameId: string) {
  if (!gameId) {
    throw new Error('Game id is required');
  }

  return prepareEnduranceNextRound(gameId);
}

export async function resumeEnduranceGameAction(gameId: string) {
  if (!gameId) {
    throw new Error('Game id is required');
  }

  return resumeEnduranceGame(gameId);
}
