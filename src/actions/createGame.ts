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

  if (mode !== 'challenge' && mode !== 'infinity' && !isDifficulty(mode)) {
    throw new Error('Unknown game mode');
  }

  const challengeMode = mode === 'challenge' || mode === 'infinity';
  const difficulty: Difficulty = isDifficulty(mode) ? mode : 'easy';
  const { getEnduranceSettings, getInfinitySettings } = await import("~/dal/settings");
  const enduranceSettings = getEnduranceSettings();
  const infinitySettings = getInfinitySettings();

  if (mode === 'challenge' && !enduranceSettings.enabled) {
    throw new Error('Challenge mode is disabled');
  }

  if (mode === 'infinity' && !infinitySettings.enabled) {
    throw new Error('Infinity mode is disabled');
  }

  const { createGameRecord } = await import("~/dal/queries");

  await createGameRecord({
    id,
    profileId,
    difficulty,
    gameMode: mode === 'challenge' ? 'endurance' : mode === 'infinity' ? 'infinity' : 'classic',
    challengeMode,
  });

  redirect(`/game/${id}`);
}
