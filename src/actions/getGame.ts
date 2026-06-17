'use server';

import { getGameByBoardId, getShuffledBoardsIds } from "~/dal/queries";
import { Difficulty } from "~/types";

export async function getGameByBoardIdAction(
  gameId: string,
  boardId: string,
  difficulty: Difficulty
) {
  return getGameByBoardId(gameId, boardId, difficulty);
}

export async function getShuffledBoardsIdsAction(excludeId?: string) {
  return getShuffledBoardsIds(excludeId);
}
