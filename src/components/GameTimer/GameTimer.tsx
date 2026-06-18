"use client";

import { IGameRecord } from "~/types";
import { useGameTimer } from "~/hooks/useGameTimer";
import { formatTime } from "~/utils/formatTime";

import styles from "./GameTimer.module.css";

interface GameTimerProps {
  game: Pick<IGameRecord, 'startedAt' | 'status' | 'time'>;
  label?: string;
  variant?: 'hud' | 'plain';
}

export function GameTimer({ game, label = 'Время', variant = 'hud' }: GameTimerProps) {
  const elapsedTime = useGameTimer(game);
  const formattedTime = formatTime(elapsedTime);

  if (variant === 'plain') {
    return formattedTime;
  }

  return (
    <div className={styles.base}>
      <div className={styles.stat}>
        <span>{label}</span>
        <strong>{formattedTime}</strong>
      </div>
    </div>
  );
}
