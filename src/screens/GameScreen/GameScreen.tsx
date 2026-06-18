'use client';

import { Suspense, use, useCallback, useEffect, useRef, useState, useTransition } from "react";
import { FaDoorOpen } from "react-icons/fa";
import { FaPuzzlePiece, FaInfo } from "react-icons/fa6";
import dynamic from "next/dynamic";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { finishGameAction } from "~/actions/finishGame";
import { AccentIconFrame } from "~/components/AccentIconFrame";
import { Button } from "~/components/Button";
import { GameCompleteModal } from "~/components/GameCompleteModal";
import { GameTimer } from "~/components/GameTimer";
import { LoadingScreen } from "~/components/LoadingScreen";
import { IGameRecord, IJigsawGame, IJigsawGameCompleteInfo } from "~/types";

import styles from './GameScreen.module.css';
import { Divider } from "~/components/Divider";
import { IconTextButton } from "~/components/IconTextButton";
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

export default function GameScreen({ data, gameRecord }: GameScreenProps) {
  const gameScreenRef = useRef<HTMLDivElement>(null);
  const finishGameRequestRef = useRef(false);
  const currentGameStateRef = useRef(data);
  const ctx = use(GlobalContext);
  const router = useRouter();
  const [currentGameRecord, setCurrentGameRecord] = useState(gameRecord);
  const [showCompletionMessage, setShowCompletionMessage] = useState(gameRecord.status !== 'active');
  const [isPending, startTransition] = useTransition();
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

      setShowCompletionMessage(true);
      if (showCompletionMessage) {
        ctx.loadingScreen.toggle(true, { seed: '/', progress: 20 });
        router.push('/');
      }
    });
  }, [ctx, currentGameRecord.id, gameIsActive, router, showCompletionMessage]);

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
              <div className={styles.titleStats}>
                <GameTimer game={currentGameRecord} label="Время: " />
              </div>
            </div>
            <Divider className={styles.divider} />
            <div className={styles.subtitle}>
              Перетаскивайте фрагменты, чтобы собрать Мозаику грёз<br />
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
        {isLoaded && (
          <GameCompleteModal
            isOpen={showCompletionMessage}
            profileId={currentGameRecord.profileId}
            onRequestClose={() => setShowCompletionMessage(false)}
            footer={(
              <>
                <Button
                  onClick={handleExit}
                  className={styles.actionButton}
                  icon={
                    <AccentIconFrame>
                      <FaDoorOpen />
                    </AccentIconFrame>
                  }
                >
                  Завершить
                </Button>
              </>
            )}
          >
            <div className={styles.completionContent}>
              <div className={styles.completionStatus}>
                {currentGameRecord.status === 'abandoned'
                  ? (
                    <div>
                      Вы <span className={styles.highlightRed}>не собрали</span> мозаику и покинули игру.<br />
                      Можете попробовать снова изменив сложность.
                    </div>
                  )
                  : (
                    <div>
                      Поздравляем! Вы <span className={styles.highlightGreen}>успешно собрали</span> мозаику!<br />
                      Вы можете попробовать собрать мозаику снова, выбрав другую сложность.
                    </div>
                  )}
              </div>
              <div className={styles.completionStat}>
                <span>Затраченное время</span>
                <strong>
                  <GameTimer game={currentGameRecord} />
                </strong>
              </div>
            </div>
          </GameCompleteModal>
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
