import db from "~/db";
import type { EnduranceSettings } from "~/types";
import { DEFAULT_ENDURANCE_SETTINGS, ENDURANCE_SETTINGS_KEYS } from "~/utils/endurance";

interface SettingRow {
  key: string;
  value: string;
}

function booleanToSetting(value: boolean) {
  return value ? '1' : '0';
}

function settingToBoolean(value: string | undefined, fallback: boolean) {
  if (value === '1') return true;
  if (value === '0') return false;

  return fallback;
}

function numberToSetting(value: number) {
  return String(value);
}

function settingToNumber(value: string | undefined, fallback: number) {
  if (typeof value === 'undefined') return fallback;

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

export function getEnduranceSettings(): EnduranceSettings {
  const keys = Object.values(ENDURANCE_SETTINGS_KEYS);
  const rows = db.query(`
    SELECT key, value
    FROM app_settings
    WHERE key IN (${keys.map(() => '?').join(', ')})
  `).all(...keys) as SettingRow[];

  const settings = new Map(rows.map((row) => [row.key, row.value]));

  return {
    enabled: settingToBoolean(
      settings.get(ENDURANCE_SETTINGS_KEYS.enabled),
      DEFAULT_ENDURANCE_SETTINGS.enabled
    ),
    infinityEnabled: settingToBoolean(
      settings.get(ENDURANCE_SETTINGS_KEYS.infinityEnabled),
      DEFAULT_ENDURANCE_SETTINGS.infinityEnabled
    ),
    initialTime: settingToNumber(
      settings.get(ENDURANCE_SETTINGS_KEYS.initialTime),
      DEFAULT_ENDURANCE_SETTINGS.initialTime
    ),
    minTimeBonus: settingToNumber(
      settings.get(ENDURANCE_SETTINGS_KEYS.minTimeBonus),
      DEFAULT_ENDURANCE_SETTINGS.minTimeBonus
    ),
    timeBonusStep: settingToNumber(
      settings.get(ENDURANCE_SETTINGS_KEYS.timeBonusStep),
      DEFAULT_ENDURANCE_SETTINGS.timeBonusStep
    ),
    milestoneRounds: settingToNumber(
      settings.get(ENDURANCE_SETTINGS_KEYS.milestoneRounds),
      DEFAULT_ENDURANCE_SETTINGS.milestoneRounds
    ),
    easyBasePoints: settingToNumber(
      settings.get(ENDURANCE_SETTINGS_KEYS.easyBasePoints),
      DEFAULT_ENDURANCE_SETTINGS.easyBasePoints
    ),
    mediumBasePoints: settingToNumber(
      settings.get(ENDURANCE_SETTINGS_KEYS.mediumBasePoints),
      DEFAULT_ENDURANCE_SETTINGS.mediumBasePoints
    ),
    hardBasePoints: settingToNumber(
      settings.get(ENDURANCE_SETTINGS_KEYS.hardBasePoints),
      DEFAULT_ENDURANCE_SETTINGS.hardBasePoints
    ),
    easyTargetTime: settingToNumber(
      settings.get(ENDURANCE_SETTINGS_KEYS.easyTargetTime),
      DEFAULT_ENDURANCE_SETTINGS.easyTargetTime
    ),
    mediumTargetTime: settingToNumber(
      settings.get(ENDURANCE_SETTINGS_KEYS.mediumTargetTime),
      DEFAULT_ENDURANCE_SETTINGS.mediumTargetTime
    ),
    hardTargetTime: settingToNumber(
      settings.get(ENDURANCE_SETTINGS_KEYS.hardTargetTime),
      DEFAULT_ENDURANCE_SETTINGS.hardTargetTime
    ),
  };
}

export function updateEnduranceSettings(settings: EnduranceSettings) {
  const now = Date.now();
  const entries = [
    [ENDURANCE_SETTINGS_KEYS.enabled, booleanToSetting(settings.enabled)],
    [ENDURANCE_SETTINGS_KEYS.infinityEnabled, booleanToSetting(settings.infinityEnabled)],
    [ENDURANCE_SETTINGS_KEYS.initialTime, numberToSetting(settings.initialTime)],
    [ENDURANCE_SETTINGS_KEYS.minTimeBonus, numberToSetting(settings.minTimeBonus)],
    [ENDURANCE_SETTINGS_KEYS.timeBonusStep, numberToSetting(settings.timeBonusStep)],
    [ENDURANCE_SETTINGS_KEYS.milestoneRounds, numberToSetting(settings.milestoneRounds)],
    [ENDURANCE_SETTINGS_KEYS.easyBasePoints, numberToSetting(settings.easyBasePoints)],
    [ENDURANCE_SETTINGS_KEYS.mediumBasePoints, numberToSetting(settings.mediumBasePoints)],
    [ENDURANCE_SETTINGS_KEYS.hardBasePoints, numberToSetting(settings.hardBasePoints)],
    [ENDURANCE_SETTINGS_KEYS.easyTargetTime, numberToSetting(settings.easyTargetTime)],
    [ENDURANCE_SETTINGS_KEYS.mediumTargetTime, numberToSetting(settings.mediumTargetTime)],
    [ENDURANCE_SETTINGS_KEYS.hardTargetTime, numberToSetting(settings.hardTargetTime)],
  ];

  const update = db.transaction(() => {
    const statement = db.query(`
      INSERT INTO app_settings (key, value, updatedAt)
      VALUES ($key, $value, $updatedAt)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updatedAt = excluded.updatedAt
    `);

    entries.forEach(([key, value]) => {
      statement.run({
        $key: key,
        $value: value,
        $updatedAt: now,
      });
    });
  });

  update();
}
