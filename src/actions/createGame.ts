'use server';

import { redirect } from "next/navigation";
import { Difficulty, GameMode } from "~/types";

interface CreateGameInput {
  id: string;
  profileId: string;
  mode: GameMode;
}

function isDifficulty(value: string): value is Difficulty {
  return value === 'easy' || value === 'medium' || value === 'hard';
}

export async function createGameAction({ id, profileId, mode }: CreateGameInput) {
  if (!profileId) {
    throw new Error('Profile is required');
  }

  if (mode !== 'challenge' && !isDifficulty(mode)) {
    throw new Error('Unknown game mode');
  }

  const challengeMode = mode === 'challenge';
  const difficulty = challengeMode ? 'easy' : mode;
  const { getEnduranceSettings } = await import("~/dal/settings");

  if (challengeMode && !getEnduranceSettings().enabled) {
    throw new Error('Challenge mode is disabled');
  }

  const { createGameRecord } = await import("~/dal/queries");

  await createGameRecord({
    id,
    profileId,
    difficulty,
    challengeMode,
  });

  redirect(`/game/${id}`);
}
