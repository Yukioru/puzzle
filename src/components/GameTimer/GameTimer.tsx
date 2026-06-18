"use client";

import { IGameRecord } from "~/types";
import { useGameTimer } from "~/hooks/useGameTimer";

interface GameTimerProps {
  game: Pick<IGameRecord, 'startedAt' | 'status' | 'time'>;
  label?: string;
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;

  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

export function GameTimer({ game, label }: GameTimerProps) {
  const elapsedTime = useGameTimer(game);
  const formattedTime = formatTime(elapsedTime);

  return label ? `${label}${formattedTime}` : formattedTime;
}
