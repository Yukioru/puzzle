import { useCallback, useEffect, useState } from "react";
import { IGameRecord } from "~/types";

function getInitialElapsedTime(game: Pick<IGameRecord, 'status' | 'time'>) {
  if (game.status !== 'active') {
    return game.time ?? 0;
  }

  return 0;
}

export function useGameTimer(game: Pick<IGameRecord, 'startedAt' | 'status' | 'time'>) {
  const getElapsedTime = useCallback(() => {
    if (game.status !== 'active') {
      return game.time ?? 0;
    }

    return Math.max(0, Date.now() - game.startedAt);
  }, [game.startedAt, game.status, game.time]);

  const [elapsedTime, setElapsedTime] = useState(() => getInitialElapsedTime(game));

  useEffect(() => {
    setElapsedTime(getElapsedTime());

    if (game.status !== 'active') return;

    const intervalId = window.setInterval(() => {
      setElapsedTime(getElapsedTime());
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [game.status, getElapsedTime]);

  return elapsedTime;
}
