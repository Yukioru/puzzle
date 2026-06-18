"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { EnduranceRoundResult, IGameRecord } from "~/types";

import styles from "./EnduranceHud.module.css";

interface EnduranceHudProps {
  game: Pick<IGameRecord, 'challengeRound' | 'challengeTimeLeft' | 'challengeLastTickAt' | 'challengePausedAt' | 'points' | 'status'>;
  lastRoundResult?: EnduranceRoundResult | null;
  onExpire?: () => void;
}

function getRemainingTime(game: EnduranceHudProps['game']) {
  if (game.status !== 'active' || game.challengePausedAt) {
    return game.challengeTimeLeft ?? 0;
  }

  const lastTickAt = game.challengeLastTickAt ?? Date.now();

  return Math.max(0, (game.challengeTimeLeft ?? 0) - (Date.now() - lastTickAt));
}

function formatCountdown(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);

  return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
}

export function EnduranceHud({ game, lastRoundResult, onExpire }: EnduranceHudProps) {
  const expireNotifiedRef = useRef(false);
  const {
    challengeLastTickAt,
    challengePausedAt,
    challengeRound,
    challengeTimeLeft,
    points,
    status,
  } = game;
  const [timeLeft, setTimeLeft] = useState(() => game.status === 'active'
    ? (game.challengeTimeLeft ?? 0)
    : getRemainingTime(game));
  const currentPoints = points ?? 0;
  const timeIsLow = timeLeft <= 10_000;

  useEffect(() => {
    expireNotifiedRef.current = false;
    setTimeLeft(getRemainingTime(game));
  }, [challengeLastTickAt, challengeRound, challengeTimeLeft, game, status]);

  useEffect(() => {
    if (game.status !== 'active' || game.challengePausedAt) return;

    const intervalId = window.setInterval(() => {
      const nextTimeLeft = getRemainingTime(game);
      setTimeLeft(nextTimeLeft);

      if (nextTimeLeft <= 0 && !expireNotifiedRef.current) {
        expireNotifiedRef.current = true;
        onExpire?.();
      }
    }, 50);

    return () => window.clearInterval(intervalId);
  }, [game, onExpire]);

  const roundBonusKey = lastRoundResult?.round ?? 0;
  const timeBonus = lastRoundResult?.timeBonus ?? 0;
  const pointsBonus = lastRoundResult?.totalPoints ?? 0;

  return (
    <div className={styles.base}>
      <div className={styles.stat}>
        <span>Раунд</span>
        <strong>{challengeRound}</strong>
      </div>
      <div className={clsx(styles.stat, styles.countdown, {
        [styles.low]: timeIsLow,
      })}>
        <span>{challengePausedAt ? 'Пауза' : 'Осталось'}</span>
        <strong>{formatCountdown(timeLeft)}</strong>
        {timeBonus > 0 && (
          <em key={`time-${roundBonusKey}`}>+{Math.round(timeBonus / 1000)} сек.</em>
        )}
      </div>
      <div className={styles.stat}>
        <span>Очки</span>
        <strong>{currentPoints}</strong>
        {pointsBonus > 0 && (
          <em key={`points-${roundBonusKey}`}>+{pointsBonus}</em>
        )}
      </div>
    </div>
  );
}
