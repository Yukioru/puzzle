'use server';

import { revalidatePath } from "next/cache";
import type { EnduranceSettings } from "~/types";
import { DEFAULT_ENDURANCE_SETTINGS } from "~/utils/endurance";

function toInteger(value: number, fallback: number, min: number) {
  if (!Number.isFinite(value)) return fallback;

  return Math.max(min, Math.round(value));
}

function normalizeEnduranceSettings(settings: EnduranceSettings): EnduranceSettings {
  return {
    enabled: Boolean(settings.enabled),
    infinityEnabled: Boolean(settings.infinityEnabled),
    initialTime: toInteger(settings.initialTime, DEFAULT_ENDURANCE_SETTINGS.initialTime, 1),
    minTimeBonus: toInteger(settings.minTimeBonus, DEFAULT_ENDURANCE_SETTINGS.minTimeBonus, 1),
    timeBonusStep: toInteger(settings.timeBonusStep, DEFAULT_ENDURANCE_SETTINGS.timeBonusStep, 0),
    milestoneRounds: toInteger(settings.milestoneRounds, DEFAULT_ENDURANCE_SETTINGS.milestoneRounds, 1),
    milestoneBaseBonus: toInteger(settings.milestoneBaseBonus, DEFAULT_ENDURANCE_SETTINGS.milestoneBaseBonus, 0),
    easyBasePoints: toInteger(settings.easyBasePoints, DEFAULT_ENDURANCE_SETTINGS.easyBasePoints, 0),
    mediumBasePoints: toInteger(settings.mediumBasePoints, DEFAULT_ENDURANCE_SETTINGS.mediumBasePoints, 0),
    hardBasePoints: toInteger(settings.hardBasePoints, DEFAULT_ENDURANCE_SETTINGS.hardBasePoints, 0),
    easyTargetTime: toInteger(settings.easyTargetTime, DEFAULT_ENDURANCE_SETTINGS.easyTargetTime, 1),
    mediumTargetTime: toInteger(settings.mediumTargetTime, DEFAULT_ENDURANCE_SETTINGS.mediumTargetTime, 1),
    hardTargetTime: toInteger(settings.hardTargetTime, DEFAULT_ENDURANCE_SETTINGS.hardTargetTime, 1),
  };
}

export async function updateEnduranceSettingsAction(settings: EnduranceSettings) {
  const { updateEnduranceSettings } = await import("~/dal/settings");
  const normalizedSettings = normalizeEnduranceSettings(settings);

  updateEnduranceSettings(normalizedSettings);
  revalidatePath('/admin/settings');
  revalidatePath('/start');

  return normalizedSettings;
}
