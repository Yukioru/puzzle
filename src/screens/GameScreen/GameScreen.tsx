'use client';

import { Suspense, use, useCallback, useEffect, useRef, useState, useTransition } from "react";
import { FaDoorOpen } from "react-icons/fa";
import { FaPuzzlePiece, FaInfo } from "react-icons/fa6";
import dynamic from "next/dynamic";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { finishGameAction } from "~/actions/finishGame";
import { LoadingScreen } from "~/components/LoadingScreen";
import { IGameRecord, IJigsawGame, IJigsawGameCompleteInfo } from "~/types";

import styles from './GameScreen.module.css';
import { Divider } from "~/components/Divider";
import { IconTextButton } from "~/components/IconTextButton";
import { useGameTimer } from "~/hooks/useGameTimer";
import { useImageLoaderManager } from "~/hooks/useImageLoaderManager";
import { GlobalContext } from "~/contexts/GlobalContext";

const JigsawGame = dynamic(
  () => import('~/components/JigsawGame'),
  {
    ssr: false,
  }
);

interface GameScreenProps {
  data: IJigsawGame;
  gameRecord: IGameRecord;
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function GameScreen({ data, gameRecord }: GameScreenProps) {
  const gameScreenRef = useRef<HTMLDivElement>(null);
  const finishGameRequestRef = useRef(false);
  const currentGameStateRef = useRef(data);
  const ctx = use(GlobalContext);
  const router = useRouter();
  const [currentGameRecord, setCurrentGameRecord] = useState(gameRecord);
  const [showCompletionMessage, setShowCompletionMessage] = useState(gameRecord.status !== 'active');
  const [isPending, startTransition] = useTransition();
  const elapsedTime = useGameTimer(currentGameRecord);
  const isLoaded = useImageLoaderManager(gameScreenRef);

  const gameIsActive = currentGameRecord.status === 'active';

  useEffect(() => {
    if (currentGameRecord.status !== 'active') {
      setShowCompletionMessage(true);
    }
  }, [currentGameRecord.status]);

  const handleGameStateChange = useCallback((gameState: IJigsawGame) => {
    currentGameStateRef.current = gameState;
  }, []);

  const handleCompleteGame = useCallback((gameInfo: IJigsawGameCompleteInfo) => {
    if (!gameIsActive || finishGameRequestRef.current) return;

    finishGameRequestRef.current = true;
    startTransition(async () => {
      const finishedGame = await finishGameAction({
        gameId: gameInfo.gameId,
        status: 'completed',
        gameState: gameInfo.gameState,
      });

      if (finishedGame) {
        setCurrentGameRecord(finishedGame);
      }

      setShowCompletionMessage(true);
    });
  }, [gameIsActive]);

  const handleExit = useCallback(() => {
    ctx.loadingScreen.toggle(true, { seed: '/', progress: 20 });

    startTransition(async () => {
      if (gameIsActive && !finishGameRequestRef.current) {
        finishGameRequestRef.current = true;
        const finishedGame = await finishGameAction({
          gameId: currentGameRecord.id,
          status: 'abandoned',
          gameState: currentGameStateRef.current,
        });

        if (finishedGame) {
          setCurrentGameRecord(finishedGame);
        }
      }

      router.push('/');
    });
  }, [ctx, currentGameRecord.id, gameIsActive, router]);

  return (
    <Suspense
      fallback={
        <LoadingScreen
          seed={`/game/${data.id}`}
          progress={25}
          progressMax={40}
          continuous
        />
      }
    >
      <div
        ref={gameScreenRef}
        className={clsx(styles.base, {
          [styles.loaded]: isLoaded,
        })}
      >
        <div className={styles.header}>
          <div className={styles.heading}>
            <div className={styles.title}>
              <FaPuzzlePiece />
              Мозаика грёз
            </div>
            <Divider className={styles.divider} />
            <div className={styles.subtitle}>
              Перетаскивайте фрагменты, чтобы собрать Мозаику грёз
            </div>
            <div className={styles.timer}>
              {formatTime(elapsedTime)}
            </div>
          </div>
          <div className={styles.actions}>
            <IconTextButton icon={<FaInfo />} className={styles.button}>
              Правила
            </IconTextButton>
            <IconTextButton
              icon={<FaDoorOpen />}
              className={styles.button}
              onClick={handleExit}
              disabled={isPending}
            >
              Выйти
            </IconTextButton>
          </div>
        </div>
        {showCompletionMessage && (
          <div className={styles.completionMessage}>
            {currentGameRecord.status === 'abandoned'
              ? 'Игра завершена досрочно'
              : 'Мозаика собрана'}
            <span>{formatTime(elapsedTime)}</span>
          </div>
        )}
        <JigsawGame
          showStock
          boardClassName={styles.board}
          stockWrapperClassName={styles.stockWrapper}
          stockClassName={styles.stockFrame}
          onComplete={gameIsActive ? handleCompleteGame : undefined}
          onGameStateChange={handleGameStateChange}
          {...data}
        />
        <div className={styles.footer}>
          <div className={styles.footerMessage}>
            Чтобы повернуть фрагмент, нажмите на него
          </div>
        </div>
      </div>
    </Suspense>
  );
}
