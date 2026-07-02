'use server';

import { revalidatePath } from "next/cache";
import type { EnduranceSettings } from "~/types";
import { normalizeEnduranceSettings } from "~/utils/gameSettings";

export async function updateEnduranceSettingsAction(settings: EnduranceSettings) {
  const { updateEnduranceSettings } = await import("~/dal/settings");
  const normalizedSettings = normalizeEnduranceSettings(settings);

  updateEnduranceSettings(normalizedSettings);
  revalidatePath('/admin/settings');
  revalidatePath('/start');

  return normalizedSettings;
}
