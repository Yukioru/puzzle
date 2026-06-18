'use client';

import { useEffect, useRef, useState } from "react";
import { getGameByBoardIdAction, getShuffledBoardsIdsAction } from "~/actions/getGame";
import { IJigsawGame } from "~/types";
import { preloadJigsawGameImages } from "~/utils/preloadJigsawGameImages";

interface UseNextJigsawGameOptions {
  delayMs?: number;
  enabled?: boolean;
  hiddenMountDelayMs?: number;
}

export function useNextJigsawGame(
  initialGame: IJigsawGame,
  {
    delayMs = 15000,
    enabled = true,
    hiddenMountDelayMs = 100,
  }: UseNextJigsawGameOptions = {}
) {
  const [game, setGame] = useState(initialGame);
  const [boardIdsQueue, setBoardIdsQueue] = useState(initialGame.shuffledBoardsIds);
  const [nextGame, setNextGame] = useState<IJigsawGame | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const hasPendingNextGameRef = useRef(false);
  const nextBoardIdsQueueRef = useRef<string[]>([]);
  const isLoadingNextGameRef = useRef(false);

  useEffect(() => {
    setGame(initialGame);
    setBoardIdsQueue(initialGame.shuffledBoardsIds);
    setNextGame(null);
    setIsTransitioning(false);
    hasPendingNextGameRef.current = false;
    nextBoardIdsQueueRef.current = [];
  }, [initialGame]);

  useEffect(() => {
    if (!enabled || hasPendingNextGameRef.current || delayMs <= 0) return;

    let isActive = true;
    let hiddenMountTimeoutId: number | null = null;

    const timeoutId = window.setTimeout(async () => {
      if (isLoadingNextGameRef.current) return;

      isLoadingNextGameRef.current = true;

      try {
        const currentQueue = boardIdsQueue.length > 0
          ? boardIdsQueue
          : await getShuffledBoardsIdsAction(game.imageFileName);
        const nextBoardId = currentQueue[0];

        if (!nextBoardId) return;

        const nextQueue = currentQueue.slice(1);
        const nextGame = await getGameByBoardIdAction(game.id, nextBoardId, game.difficulty);

        await preloadJigsawGameImages(nextGame);

        if (isActive) {
          nextBoardIdsQueueRef.current = nextQueue;
          hasPendingNextGameRef.current = true;
          setNextGame(nextGame);
          hiddenMountTimeoutId = window.setTimeout(() => {
            if (isActive) {
              setIsTransitioning(true);
            }
          }, hiddenMountDelayMs);
        }
      } finally {
        isLoadingNextGameRef.current = false;
      }
    }, delayMs);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);

      if (hiddenMountTimeoutId) {
        window.clearTimeout(hiddenMountTimeoutId);
      }
    };
  }, [boardIdsQueue, delayMs, enabled, game, hiddenMountDelayMs]);

  function commitNextGame() {
    if (!nextGame) return;

    setGame(nextGame);
    setBoardIdsQueue(nextBoardIdsQueueRef.current);
    setNextGame(null);
    setIsTransitioning(false);
    hasPendingNextGameRef.current = false;
    nextBoardIdsQueueRef.current = [];
  }

  return {
    game,
    nextGame,
    isTransitioning,
    commitNextGame,
  };
}
