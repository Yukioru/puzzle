import { Difficulty, EnduranceRoundResult } from "~/types";

export const ENDURANCE_INITIAL_TIME = 40_000;
export const ENDURANCE_MIN_TIME_BONUS = 5_000;
export const ENDURANCE_TIME_BONUS_STEP = 3_000;
export const ENDURANCE_MILESTONE_ROUNDS = 5;

const basePointsByDifficulty: Record<Difficulty, number> = {
  easy: 100,
  medium: 180,
  hard: 300,
};

const roundTargetTimeByDifficulty: Record<Difficulty, number> = {
  easy: 18_000,
  medium: 32_000,
  hard: 48_000,
};

export function getEnduranceDifficulty(round: number): Difficulty {
  if (round <= 5) return 'easy';
  if (round <= 10) return 'medium';

  return 'hard';
}

export function getEnduranceTimeBonus(round: number) {
  const bonus = ENDURANCE_INITIAL_TIME - ((round - 1) * ENDURANCE_TIME_BONUS_STEP);

  return Math.max(ENDURANCE_MIN_TIME_BONUS, bonus);
}

export function getEnduranceRank(points: number) {
  if (points >= 10_000) return 'S';
  if (points >= 7_000) return 'A';
  if (points >= 4_000) return 'B';
  if (points >= 2_000) return 'C';

  return 'D';
}

export function calculateEnduranceRoundResult({
  round,
  difficulty,
  roundTime,
}: {
  round: number;
  difficulty: Difficulty;
  roundTime: number;
}): EnduranceRoundResult {
  const basePoints = basePointsByDifficulty[difficulty];
  const targetTime = roundTargetTimeByDifficulty[difficulty];
  const speedMultiplier = Math.max(0.5, Math.min(2, targetTime / Math.max(roundTime, 1)));
  const speedPoints = Math.round(basePoints * speedMultiplier);
  const milestoneBonus = round % ENDURANCE_MILESTONE_ROUNDS === 0
    ? 500 + (round * 50)
    : 0;
  const totalPoints = speedPoints + milestoneBonus;
  const timeBonus = getEnduranceTimeBonus(round);

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
