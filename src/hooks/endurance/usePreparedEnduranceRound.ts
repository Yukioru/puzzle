"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { prepareEnduranceNextRoundAction } from "~/actions/finishGame";
import { IJigsawGame } from "~/types";
import { preloadJigsawGameImages } from "~/utils/preloadJigsawGameImages";

type PreparedRoundStatus = 'idle' | 'loading' | 'ready';

export function usePreparedEnduranceRound({
  enabled,
  gameId,
  round,
}: {
  enabled: boolean;
  gameId: string;
  round: number;
}) {
  const requestKeyRef = useRef<string | null>(null);
  const [preparedGame, setPreparedGame] = useState<IJigsawGame | null>(null);
  const [status, setStatus] = useState<PreparedRoundStatus>('idle');

  const preloadPreparedGame = useCallback(async (game: IJigsawGame) => {
    setStatus('loading');
    await preloadJigsawGameImages(game);
    setPreparedGame(game);
    setStatus('ready');

    return game;
  }, []);

  useEffect(() => {
    if (!enabled) {
      requestKeyRef.current = null;
      setPreparedGame(null);
      setStatus('idle');
      return;
    }

    const requestKey = `${gameId}:${round + 1}`;
    if (requestKeyRef.current === requestKey) return;

    let isActive = true;
    requestKeyRef.current = requestKey;
    setPreparedGame(null);
    setStatus('loading');

    prepareEnduranceNextRoundAction(gameId)
      .then(async (nextGame) => {
        if (!nextGame || !isActive) return;

        await preloadJigsawGameImages(nextGame);

        if (!isActive) return;

        setPreparedGame(nextGame);
        setStatus('ready');
      })
      .catch(() => {
        if (isActive) {
          requestKeyRef.current = null;
          setStatus('idle');
        }
      });

    return () => {
      isActive = false;
    };
  }, [enabled, gameId, round]);

  return {
    isPrepared: status === 'ready',
    preparedGame,
    preloadPreparedGame,
    status,
  };
}
