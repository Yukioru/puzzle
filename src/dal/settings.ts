import db from "~/db";
import { notifyLeaderboardsChanged } from "~/dal/leaderboardEvents";
import type { BoardSettings, EnduranceSettings, InfinitySettings } from "~/types";
import { BOARD_SETTINGS_KEYS, DEFAULT_BOARD_SETTINGS } from "~/utils/boardSettings";
import { DEFAULT_ENDURANCE_SETTINGS, ENDURANCE_SETTINGS_KEYS } from "~/utils/endurance";
import { DEFAULT_INFINITY_SETTINGS, INFINITY_SETTINGS_KEYS } from "~/utils/infinity";
import { numberToSetting, settingToNumber } from "~/utils/numberSettings";

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
    maxTimeMultiplier: settingToNumber(
      settings.get(ENDURANCE_SETTINGS_KEYS.maxTimeMultiplier),
      DEFAULT_ENDURANCE_SETTINGS.maxTimeMultiplier
    ),
    milestoneRounds: settingToNumber(
      settings.get(ENDURANCE_SETTINGS_KEYS.milestoneRounds),
      DEFAULT_ENDURANCE_SETTINGS.milestoneRounds
    ),
    milestoneBaseBonus: settingToNumber(
      settings.get(ENDURANCE_SETTINGS_KEYS.milestoneBaseBonus),
      DEFAULT_ENDURANCE_SETTINGS.milestoneBaseBonus
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
    cRankPoints: settingToNumber(
      settings.get(ENDURANCE_SETTINGS_KEYS.cRankPoints),
      DEFAULT_ENDURANCE_SETTINGS.cRankPoints
    ),
    bRankPoints: settingToNumber(
      settings.get(ENDURANCE_SETTINGS_KEYS.bRankPoints),
      DEFAULT_ENDURANCE_SETTINGS.bRankPoints
    ),
    aRankPoints: settingToNumber(
      settings.get(ENDURANCE_SETTINGS_KEYS.aRankPoints),
      DEFAULT_ENDURANCE_SETTINGS.aRankPoints
    ),
    sRankPoints: settingToNumber(
      settings.get(ENDURANCE_SETTINGS_KEYS.sRankPoints),
      DEFAULT_ENDURANCE_SETTINGS.sRankPoints
    ),
    ssRankPoints: settingToNumber(
      settings.get(ENDURANCE_SETTINGS_KEYS.ssRankPoints),
      DEFAULT_ENDURANCE_SETTINGS.ssRankPoints
    ),
  };
}

export function getInfinitySettings(): InfinitySettings {
  const keys = Object.values(INFINITY_SETTINGS_KEYS);
  const rows = db.query(`
    SELECT key, value
    FROM app_settings
    WHERE key IN (${keys.map(() => '?').join(', ')})
  `).all(...keys) as SettingRow[];

  const settings = new Map(rows.map((row) => [row.key, row.value]));

  return {
    enabled: settingToBoolean(
      settings.get(INFINITY_SETTINGS_KEYS.enabled),
      DEFAULT_INFINITY_SETTINGS.enabled
    ),
  };
}

export function getBoardSettings(): BoardSettings {
  const row = db.query(`
    SELECT value
    FROM app_settings
    WHERE key = $key
  `).get({ $key: BOARD_SETTINGS_KEYS.matchProfileBoards }) as Pick<SettingRow, 'value'> | null;

  return {
    matchProfileBoards: settingToBoolean(
      row?.value,
      DEFAULT_BOARD_SETTINGS.matchProfileBoards
    ),
  };
}

export function updateEnduranceSettings(settings: EnduranceSettings) {
  const now = Date.now();
  const entries = [
    [ENDURANCE_SETTINGS_KEYS.enabled, booleanToSetting(settings.enabled)],
    [ENDURANCE_SETTINGS_KEYS.initialTime, numberToSetting(settings.initialTime)],
    [ENDURANCE_SETTINGS_KEYS.minTimeBonus, numberToSetting(settings.minTimeBonus)],
    [ENDURANCE_SETTINGS_KEYS.timeBonusStep, numberToSetting(settings.timeBonusStep)],
    [ENDURANCE_SETTINGS_KEYS.maxTimeMultiplier, numberToSetting(settings.maxTimeMultiplier)],
    [ENDURANCE_SETTINGS_KEYS.milestoneRounds, numberToSetting(settings.milestoneRounds)],
    [ENDURANCE_SETTINGS_KEYS.milestoneBaseBonus, numberToSetting(settings.milestoneBaseBonus)],
    [ENDURANCE_SETTINGS_KEYS.easyBasePoints, numberToSetting(settings.easyBasePoints)],
    [ENDURANCE_SETTINGS_KEYS.mediumBasePoints, numberToSetting(settings.mediumBasePoints)],
    [ENDURANCE_SETTINGS_KEYS.hardBasePoints, numberToSetting(settings.hardBasePoints)],
    [ENDURANCE_SETTINGS_KEYS.easyTargetTime, numberToSetting(settings.easyTargetTime)],
    [ENDURANCE_SETTINGS_KEYS.mediumTargetTime, numberToSetting(settings.mediumTargetTime)],
    [ENDURANCE_SETTINGS_KEYS.hardTargetTime, numberToSetting(settings.hardTargetTime)],
    [ENDURANCE_SETTINGS_KEYS.cRankPoints, numberToSetting(settings.cRankPoints)],
    [ENDURANCE_SETTINGS_KEYS.bRankPoints, numberToSetting(settings.bRankPoints)],
    [ENDURANCE_SETTINGS_KEYS.aRankPoints, numberToSetting(settings.aRankPoints)],
    [ENDURANCE_SETTINGS_KEYS.sRankPoints, numberToSetting(settings.sRankPoints)],
    [ENDURANCE_SETTINGS_KEYS.ssRankPoints, numberToSetting(settings.ssRankPoints)],
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
  notifyLeaderboardsChanged();
}

export function updateInfinitySettings(settings: InfinitySettings) {
  const now = Date.now();

  db.query(`
    INSERT INTO app_settings (key, value, updatedAt)
    VALUES ($key, $value, $updatedAt)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updatedAt = excluded.updatedAt
  `).run({
    $key: INFINITY_SETTINGS_KEYS.enabled,
    $value: booleanToSetting(settings.enabled),
    $updatedAt: now,
  });
}

export function updateBoardSettings(settings: BoardSettings) {
  const now = Date.now();

  db.query(`
    INSERT INTO app_settings (key, value, updatedAt)
    VALUES ($key, $value, $updatedAt)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updatedAt = excluded.updatedAt
  `).run({
    $key: BOARD_SETTINGS_KEYS.matchProfileBoards,
    $value: booleanToSetting(settings.matchProfileBoards),
    $updatedAt: now,
  });
}
