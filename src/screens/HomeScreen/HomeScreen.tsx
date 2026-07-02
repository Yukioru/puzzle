'use client';

import Link from "next/link";
import { Button } from "~/components/Button";
import { HomeScreenAdminTrigger } from "~/components/HomeScreenAdminTrigger";
import { Leaderboards } from "~/components/Leaderboards";
import { useLeaderboardsStream } from "~/hooks/useLeaderboardsStream";
import { LeaderboardsSnapshot } from "~/types";

import styles from './HomeScreen.module.css';

type HomeScreenProps = LeaderboardsSnapshot;

export default function HomeScreen({
  enduranceLeaderboard,
  difficultyLeaderboards,
  enduranceSettings,
}: HomeScreenProps) {
  const snapshot = useLeaderboardsStream({
    enduranceLeaderboard,
    difficultyLeaderboards,
    enduranceSettings,
  });

  return (
    <div className={styles.overlay}>
      <HomeScreenAdminTrigger />

      <header className={styles.header}>
        <h1>
          Honkai: Star Rail — Мозаика грёз
        </h1>
      </header>

      <div className={styles.leaderboard}>
        <Leaderboards
          enduranceEntries={snapshot.enduranceLeaderboard}
          difficultyEntries={snapshot.difficultyLeaderboards}
          showEndurance={snapshot.enduranceSettings.enabled}
        />
      </div>

      <div className={styles.footer}>
        <Button
          as={Link}
          href="/start"
          className={styles.button}
        >
          Начать игру
        </Button>
      </div>
    </div>
  );
}
