import { getDifficultyLeaderboards, getEnduranceLeaderboard } from "~/dal/queries";
import { getEnduranceSettings } from "~/dal/settings";
import type { LeaderboardsSnapshot } from "~/types";

export async function getLeaderboardsSnapshot(): Promise<LeaderboardsSnapshot> {
  const [enduranceLeaderboard, difficultyLeaderboards] = await Promise.all([
    getEnduranceLeaderboard(),
    getDifficultyLeaderboards(),
  ]);

  return {
    enduranceLeaderboard,
    difficultyLeaderboards,
    enduranceSettings: getEnduranceSettings(),
  };
}
