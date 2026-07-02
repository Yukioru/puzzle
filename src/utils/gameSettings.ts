import type { EnduranceSettings, InfinitySettings } from "~/types";
import { DEFAULT_ENDURANCE_SETTINGS } from "~/utils/endurance";
import { normalizeInteger, normalizeNumber } from "~/utils/numberSettings";

export function normalizeEnduranceSettings(settings: EnduranceSettings): EnduranceSettings {
  return {
    enabled: Boolean(settings.enabled),
    initialTime: normalizeInteger(settings.initialTime, DEFAULT_ENDURANCE_SETTINGS.initialTime, 1),
    minTimeBonus: normalizeInteger(settings.minTimeBonus, DEFAULT_ENDURANCE_SETTINGS.minTimeBonus, 0),
    timeBonusStep: normalizeInteger(settings.timeBonusStep, DEFAULT_ENDURANCE_SETTINGS.timeBonusStep, 0),
    maxTimeMultiplier: normalizeNumber(settings.maxTimeMultiplier, DEFAULT_ENDURANCE_SETTINGS.maxTimeMultiplier, 1),
    milestoneRounds: normalizeInteger(settings.milestoneRounds, DEFAULT_ENDURANCE_SETTINGS.milestoneRounds, 1),
    milestoneBaseBonus: normalizeInteger(settings.milestoneBaseBonus, DEFAULT_ENDURANCE_SETTINGS.milestoneBaseBonus, 0),
    easyBasePoints: normalizeInteger(settings.easyBasePoints, DEFAULT_ENDURANCE_SETTINGS.easyBasePoints, 0),
    mediumBasePoints: normalizeInteger(settings.mediumBasePoints, DEFAULT_ENDURANCE_SETTINGS.mediumBasePoints, 0),
    hardBasePoints: normalizeInteger(settings.hardBasePoints, DEFAULT_ENDURANCE_SETTINGS.hardBasePoints, 0),
    easyTargetTime: normalizeInteger(settings.easyTargetTime, DEFAULT_ENDURANCE_SETTINGS.easyTargetTime, 1),
    mediumTargetTime: normalizeInteger(settings.mediumTargetTime, DEFAULT_ENDURANCE_SETTINGS.mediumTargetTime, 1),
    hardTargetTime: normalizeInteger(settings.hardTargetTime, DEFAULT_ENDURANCE_SETTINGS.hardTargetTime, 1),
  };
}

export function normalizeInfinitySettings(settings: InfinitySettings): InfinitySettings {
  return {
    enabled: Boolean(settings.enabled),
  };
}
