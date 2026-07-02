'use client';

import Link from "next/link";
import { Button } from "~/components/Button";
import { EnduranceLeaderboard } from "~/components/EnduranceLeaderboard";
import { EnduranceLeaderboardEntry, EnduranceSettings } from "~/types";

import styles from './HomeScreen.module.css';

interface HomeScreenProps {
  leaderboard: EnduranceLeaderboardEntry[];
  enduranceSettings: EnduranceSettings;
}

export default function HomeScreen({ leaderboard, enduranceSettings }: HomeScreenProps) {
  return (
    <div className={styles.overlay}>
      <header className={styles.header}>
        <h1>
          Honkai: Star Rail<br/>
          Мозаика грёз
        </h1>
      </header>

      {enduranceSettings.enabled && (
        <div className={styles.leaderboard}>
          <EnduranceLeaderboard entries={leaderboard} />
        </div>
      )}

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
