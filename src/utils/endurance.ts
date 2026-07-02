import { Difficulty, EnduranceRoundResult, EnduranceSettings } from "~/types";

export const ENDURANCE_INITIAL_TIME = 60_000;
export const ENDURANCE_MIN_TIME_BONUS = 1_000;
export const ENDURANCE_TIME_BONUS_STEP = 20_000;
export const ENDURANCE_MAX_TIME_MULTIPLIER = 3;
export const ENDURANCE_FIRST_TIME_BONUS_RATIO = 0.5;
export const ENDURANCE_MILESTONE_ROUNDS = 3;
export const ENDURANCE_MILESTONE_BASE_BONUS = 350;

export const ENDURANCE_SETTINGS_KEYS = {
  enabled: 'endurance.enabled',
  initialTime: 'endurance.initialTime',
  minTimeBonus: 'endurance.minTimeBonus',
  timeBonusStep: 'endurance.timeBonusStep',
  maxTimeMultiplier: 'endurance.maxTimeMultiplier',
  milestoneRounds: 'endurance.milestoneRounds',
  milestoneBaseBonus: 'endurance.milestoneBaseBonus',
  easyBasePoints: 'endurance.easyBasePoints',
  mediumBasePoints: 'endurance.mediumBasePoints',
  hardBasePoints: 'endurance.hardBasePoints',
  easyTargetTime: 'endurance.easyTargetTime',
  mediumTargetTime: 'endurance.mediumTargetTime',
  hardTargetTime: 'endurance.hardTargetTime',
} as const;

export const ENDURANCE_BASE_POINTS_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 150,
  medium: 250,
  hard: 400,
};

export const ENDURANCE_ROUND_TARGET_TIME_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 15_000,
  medium: 28_000,
  hard: 35_000,
};

export const DEFAULT_ENDURANCE_SETTINGS: EnduranceSettings = {
  enabled: true,
  initialTime: ENDURANCE_INITIAL_TIME,
  minTimeBonus: ENDURANCE_MIN_TIME_BONUS,
  timeBonusStep: ENDURANCE_TIME_BONUS_STEP,
  maxTimeMultiplier: ENDURANCE_MAX_TIME_MULTIPLIER,
  milestoneRounds: ENDURANCE_MILESTONE_ROUNDS,
  milestoneBaseBonus: ENDURANCE_MILESTONE_BASE_BONUS,
  easyBasePoints: ENDURANCE_BASE_POINTS_BY_DIFFICULTY.easy,
  mediumBasePoints: ENDURANCE_BASE_POINTS_BY_DIFFICULTY.medium,
  hardBasePoints: ENDURANCE_BASE_POINTS_BY_DIFFICULTY.hard,
  easyTargetTime: ENDURANCE_ROUND_TARGET_TIME_BY_DIFFICULTY.easy,
  mediumTargetTime: ENDURANCE_ROUND_TARGET_TIME_BY_DIFFICULTY.medium,
  hardTargetTime: ENDURANCE_ROUND_TARGET_TIME_BY_DIFFICULTY.hard,
};

export function getEnduranceDifficulty(round: number): Difficulty {
  if (round <= 3) return 'easy';
  if (round <= 6) return 'medium';

  return 'hard';
}

function getBasePointsByDifficulty(settings: EnduranceSettings): Record<Difficulty, number> {
  return {
    easy: settings.easyBasePoints,
    medium: settings.mediumBasePoints,
    hard: settings.hardBasePoints,
  };
}

function getRoundTargetTimeByDifficulty(settings: EnduranceSettings): Record<Difficulty, number> {
  return {
    easy: settings.easyTargetTime,
    medium: settings.mediumTargetTime,
    hard: settings.hardTargetTime,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getEnduranceRawTimeBonus(round: number, settings: EnduranceSettings) {
  const firstRoundBonus = Math.max(
    settings.minTimeBonus,
    settings.initialTime * ENDURANCE_FIRST_TIME_BONUS_RATIO
  );
  const decay = clamp(
    1 - (settings.timeBonusStep / Math.max(settings.initialTime, 1)),
    0.5,
    0.9
  );
  const decayedBonus = firstRoundBonus * (decay ** (round - 1));

  return Math.round(Math.max(settings.minTimeBonus, decayedBonus));
}

export function getEnduranceTimeBonus(round: number, settings = DEFAULT_ENDURANCE_SETTINGS) {
  const maxBonusBudget = Math.round(settings.initialTime * Math.max(0, settings.maxTimeMultiplier - 1));
  const rawBonus = getEnduranceRawTimeBonus(round, settings);
  let spentBonusBudget = 0;

  for (let previousRound = 1; previousRound < round; previousRound += 1) {
    const previousRawBonus = getEnduranceRawTimeBonus(previousRound, settings);
    const remainingBonusBudget = Math.max(0, maxBonusBudget - spentBonusBudget);

    spentBonusBudget += Math.min(previousRawBonus, remainingBonusBudget);
  }

  const remainingBonusBudget = Math.max(0, maxBonusBudget - spentBonusBudget);

  return Math.min(rawBonus, remainingBonusBudget);
}

export function getEnduranceRank(points: number) {
  if (points >= 4_500) return 'SS';
  if (points >= 3_200) return 'S';
  if (points >= 2_000) return 'A';
  if (points >= 1_200) return 'B';
  if (points >= 800) return 'C';

  return 'D';
}

export function calculateEnduranceRoundResult({
  round,
  difficulty,
  roundTime,
  settings = DEFAULT_ENDURANCE_SETTINGS,
}: {
  round: number;
  difficulty: Difficulty;
  roundTime: number;
  settings?: EnduranceSettings;
}): EnduranceRoundResult {
  const basePoints = getBasePointsByDifficulty(settings)[difficulty];
  const targetTime = getRoundTargetTimeByDifficulty(settings)[difficulty];
  const speedMultiplier = Math.max(0.5, Math.min(2, targetTime / Math.max(roundTime, 1)));
  const speedPoints = Math.round(basePoints * speedMultiplier);
  const milestoneBonus = round % settings.milestoneRounds === 0
    ? settings.milestoneBaseBonus + (round * 50)
    : 0;
  const totalPoints = speedPoints + milestoneBonus;
  const timeBonus = getEnduranceTimeBonus(round, settings);

  return {
    round,
    difficulty,
    roundTime,
    basePoints,
    speedMultiplier,
    speedPoints,
    milestoneBonus,
    totalPoints,
    timeBonus,
    nextDifficulty: getEnduranceDifficulty(round + 1),
  };
}
