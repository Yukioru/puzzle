'use server';

import { revalidatePath } from "next/cache";
import type { EnduranceSettings, InfinitySettings } from "~/types";
import { normalizeEnduranceSettings, normalizeInfinitySettings } from "~/utils/gameSettings";

interface GameSettingsInput {
  endurance: EnduranceSettings;
  infinity: InfinitySettings;
}

export async function updateGameSettingsAction(settings: GameSettingsInput) {
  const { updateEnduranceSettings, updateInfinitySettings } = await import("~/dal/settings");
  const normalizedSettings = {
    endurance: normalizeEnduranceSettings(settings.endurance),
    infinity: normalizeInfinitySettings(settings.infinity),
  };

  updateEnduranceSettings(normalizedSettings.endurance);
  updateInfinitySettings(normalizedSettings.infinity);
  revalidatePath('/admin/settings');
  revalidatePath('/start');

  return normalizedSettings;
}
