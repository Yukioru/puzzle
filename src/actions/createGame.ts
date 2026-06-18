'use server';

import { redirect } from "next/navigation";
import { createGameRecord } from "~/dal/queries";
import { Difficulty, GameMode } from "~/types";

interface CreateGameInput {
  profileId: string;
  mode: GameMode;
}

function isDifficulty(value: string): value is Difficulty {
  return value === 'easy' || value === 'medium' || value === 'hard';
}

export async function createGameAction({ profileId, mode }: CreateGameInput) {
  if (!profileId) {
    throw new Error('Profile is required');
  }

  if (mode !== 'challenge' && !isDifficulty(mode)) {
    throw new Error('Unknown game mode');
  }

  const id = crypto.randomUUID();
  const challengeMode = mode === 'challenge';
  const difficulty = challengeMode ? 'easy' : mode;

  await createGameRecord({
    id,
    profileId,
    difficulty,
    challengeMode,
  });

  redirect(`/game/${id}`);
}
