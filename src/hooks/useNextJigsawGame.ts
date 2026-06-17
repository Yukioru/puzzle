'use client';

import { useEffect, useRef, useState } from "react";
import { getGameByBoardIdAction, getShuffledBoardsIdsAction } from "~/actions/getGame";
import { IJigsawGame } from "~/types";

interface UseNextJigsawGameOptions {
  delayMs?: number;
  enabled?: boolean;
  hiddenMountDelayMs?: number;
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

function getGameImageUrls(game: IJigsawGame) {
  const imageUrls = new Set<string>();
  const pieces = [...game.pieces, ...game.initialPieces, ...game.playablePieces];

  pieces.forEach((piece) => {
    imageUrls.add(piece.imageUrl);

    if (piece.isEmpty) {
      const imageFile = piece.imageUrl.split('/').pop();

      if (imageFile) {
        imageUrls.add(`/pieces/outline/${game.imageFileName}/${game.difficulty}/${imageFile}`);
      }
    }
  });

  return Array.from(imageUrls);
}

async function preloadGameImages(game: IJigsawGame) {
  await Promise.all(getGameImageUrls(game).map(preloadImage));
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

        await preloadGameImages(nextGame);

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
