"use client";

import { IGameRecord } from "~/types";
import { useGameTimer } from "~/hooks/useGameTimer";

import styles from "./GameTimer.module.css";

interface GameTimerProps {
  game: Pick<IGameRecord, 'startedAt' | 'status' | 'time'>;
  label?: string;
  variant?: 'hud' | 'plain';
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;

  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
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
