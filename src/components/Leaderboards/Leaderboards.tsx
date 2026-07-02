"use client";

import clsx from "clsx";
import { Difficulty, DifficultyLeaderboardEntry, EnduranceLeaderboardEntry } from "~/types";
import { Leaderboard, LeaderboardItemData, TabbedLeaderboard, TabbedLeaderboardTab } from "~/components/Leaderboard";
import { formatTime } from "~/utils/formatTime";
import styles from "./Leaderboards.module.css";

interface LeaderboardsProps {
  enduranceEntries: EnduranceLeaderboardEntry[];
  difficultyEntries: Record<Difficulty, DifficultyLeaderboardEntry[]>;
  showEndurance: boolean;
}

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Лёгкий",
  medium: "Средний",
  hard: "Сложный",
};

function createEnduranceItems(entries: EnduranceLeaderboardEntry[]): LeaderboardItemData[] {
  return entries.map((entry) => ({
    id: entry.gameId,
    profileId: entry.profileId,
    meta: `${entry.rounds} раундов · ${formatTime(entry.time)}`,
    value: String(entry.points),
    valueCaption: entry.rank,
  }));
}

function createDifficultyItems(entries: DifficultyLeaderboardEntry[]): LeaderboardItemData[] {
  return entries.map((entry) => ({
    id: entry.gameId,
    profileId: entry.profileId,
    value: formatTime(entry.time),
  }));
}

function createDifficultyTabs(
  entries: Record<Difficulty, DifficultyLeaderboardEntry[]>
): TabbedLeaderboardTab<Difficulty>[] {
  return (["easy", "medium", "hard"] as Difficulty[]).map((difficulty) => ({
    id: difficulty,
    label: difficultyLabels[difficulty],
    items: createDifficultyItems(entries[difficulty]),
  }));
}

export function Leaderboards({
  enduranceEntries,
  difficultyEntries,
  showEndurance,
}: LeaderboardsProps) {
  return (
    <section
      className={clsx(styles.base, {
        [styles.single]: !showEndurance,
      })}
      aria-label="Лидерборды"
    >
      <TabbedLeaderboard
        title="Классика"
        emptyText="Здесь пока нет завершённых игр"
        tabs={createDifficultyTabs(difficultyEntries)}
        defaultTab="easy"
        ariaLabel="Сложность классического лидерборда"
      />
      {showEndurance && (
        <Leaderboard
          title="Испытание"
          caption="Рейтинговая таблица по очкам"
          emptyText="Здесь пока нет завершённых игр"
          items={createEnduranceItems(enduranceEntries)}
        />
      )}
    </section>
  );
}
