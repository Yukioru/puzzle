'use server';

import { revalidatePath } from "next/cache";
import type { BoardSettings, EnduranceSettings, InfinitySettings } from "~/types";
import { normalizeBoardSettings, normalizeEnduranceSettings, normalizeInfinitySettings } from "~/utils/gameSettings";

interface GameSettingsInput {
  boards: BoardSettings;
  endurance: EnduranceSettings;
  infinity: InfinitySettings;
}

export async function updateGameSettingsAction(settings: GameSettingsInput) {
  const { updateBoardSettings, updateEnduranceSettings, updateInfinitySettings } = await import("~/dal/settings");
  const normalizedSettings = {
    boards: normalizeBoardSettings(settings.boards),
    endurance: normalizeEnduranceSettings(settings.endurance),
    infinity: normalizeInfinitySettings(settings.infinity),
  };

  updateBoardSettings(normalizedSettings.boards);
  updateEnduranceSettings(normalizedSettings.endurance);
  updateInfinitySettings(normalizedSettings.infinity);
  revalidatePath('/admin/settings');
  revalidatePath('/start');

  return normalizedSettings;
}
