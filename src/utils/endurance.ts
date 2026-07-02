import { Difficulty, EnduranceRoundResult, EnduranceSettings } from "~/types";

export const ENDURANCE_INITIAL_TIME = 60_000;
export const ENDURANCE_MIN_TIME_BONUS = 1_300;
export const ENDURANCE_TIME_BONUS_STEP = 650;
export const ENDURANCE_MILESTONE_ROUNDS = 3;
export const ENDURANCE_MILESTONE_BASE_BONUS = 350;

export const ENDURANCE_SETTINGS_KEYS = {
  enabled: 'endurance.enabled',
  initialTime: 'endurance.initialTime',
  minTimeBonus: 'endurance.minTimeBonus',
  timeBonusStep: 'endurance.timeBonusStep',
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

export function getEnduranceTimeBonus(round: number, settings = DEFAULT_ENDURANCE_SETTINGS) {
  const bonus = settings.initialTime - ((round - 1) * settings.timeBonusStep);

  return Math.max(settings.minTimeBonus, bonus);
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
