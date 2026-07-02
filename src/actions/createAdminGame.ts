'use server';

import { redirect } from "next/navigation";

type AdminGameMode = 'challenge' | 'infinity';

interface CreateAdminGameInput {
  id: string;
  profileId: string;
  mode: AdminGameMode;
}

export async function createAdminGameAction({ id, profileId, mode }: CreateAdminGameInput) {
  if (!profileId) {
    throw new Error('Profile is required');
  }

  const { createGameRecord } = await import("~/dal/queries");

  await createGameRecord({
    id,
    profileId,
    difficulty: 'easy',
    gameMode: mode === 'challenge' ? 'endurance' : 'infinity',
    challengeMode: true,
  });

  redirect(`/game/${id}`);
}
