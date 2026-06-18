'use client';

import { CSSProperties, Suspense, use, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { FaDoorOpen } from "react-icons/fa";
import { FaPuzzlePiece, FaInfo } from "react-icons/fa6";
import dynamic from "next/dynamic";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { completeEnduranceRoundAction, finishGameAction, pauseEnduranceGameAction, resumeEnduranceGameAction } from "~/actions/finishGame";
import { AccentIconFrame } from "~/components/AccentIconFrame";
import { Button } from "~/components/Button";
import { EnduranceHud } from "~/components/EnduranceHud";
import { GameCompleteModal } from "~/components/GameCompleteModal";
import { GameInfoModal } from "~/components/GameInfoModal";
import { GameTimer } from "~/components/GameTimer";
import { LoadingScreen } from "~/components/LoadingScreen";
import { EnduranceRoundResult, IGameRecord, IJigsawGame, IJigsawGameCompleteInfo } from "~/types";
import { getEnduranceRank } from "~/utils/endurance";

import styles from './GameScreen.module.css';
import { Divider } from "~/components/Divider";
import { IconTextButton } from "~/components/IconTextButton";
import { usePreparedEnduranceRound } from "~/hooks/endurance/usePreparedEnduranceRound";
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
  const gameInfoOpenRef = useRef(false);
  const gameInfoPauseRequestRef = useRef<Promise<IGameRecord | null> | null>(null);
  const gameInfoShouldResumeRef = useRef(false);
  const roundCompletionRequestRef = useRef(false);
  const currentGameStateRef = useRef(data);
  const ctx = use(GlobalContext);
  const router = useRouter();
  const [activeBuffer, setActiveBuffer] = useState<'primary' | 'secondary'>('primary');
  const [primaryGameState, setPrimaryGameState] = useState<IJigsawGame>(data);
  const [secondaryGameState, setSecondaryGameState] = useState<IJigsawGame | null>(null);
  const [currentGameRecord, setCurrentGameRecord] = useState(gameRecord);
  const [lastEnduranceRoundResult, setLastEnduranceRoundResult] = useState<EnduranceRoundResult | null>(null);
  const [showCompletionMessage, setShowCompletionMessage] = useState(gameRecord.status !== 'active');
  const [showGameInfo, setShowGameInfo] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isLoaded = useImageLoaderManager(gameScreenRef);

  const gameIsActive = currentGameRecord.status === 'active';
  const isEndurance = currentGameRecord.challengeMode;
  const activeGameState = activeBuffer === 'primary'
    ? primaryGameState
    : secondaryGameState ?? primaryGameState;
  const gameBackgroundStyle = useMemo(() => {
    const palette = activeGameState.palette;

    if (!palette) return undefined;

    return {
      '--game-bg-base': palette.base,
      '--game-bg-accent-1': palette.accents[0],
      '--game-bg-accent-2': palette.accents[1],
      '--game-bg-accent-3': palette.accents[2],
    } as CSSProperties;
  }, [activeGameState.palette]);
  const preparedBuffer = activeBuffer === 'primary' ? 'secondary' : 'primary';
  const preparedEnduranceRound = usePreparedEnduranceRound({
    enabled: isEndurance && gameIsActive,
    gameId: currentGameRecord.id,
    round: currentGameRecord.challengeRound,
  });

  useEffect(() => {
    if (currentGameRecord.status !== 'active') {
      setShowCompletionMessage(true);
    }
  }, [currentGameRecord.status]);

  useEffect(() => {
    currentGameStateRef.current = activeGameState;
  }, [activeGameState]);

  useEffect(() => {
    gameInfoOpenRef.current = showGameInfo;
  }, [showGameInfo]);

  useEffect(() => {
    if (!isEndurance || !preparedEnduranceRound.preparedGame) return;

    if (preparedBuffer === 'primary') {
      setPrimaryGameState(preparedEnduranceRound.preparedGame);
      return;
    }

    setSecondaryGameState(preparedEnduranceRound.preparedGame);
  }, [isEndurance, preparedBuffer, preparedEnduranceRound.preparedGame]);

  const handleGameStateChange = useCallback((gameState: IJigsawGame) => {
    currentGameStateRef.current = gameState;
  }, []);

  const handleCompleteGame = useCallback((gameInfo: IJigsawGameCompleteInfo) => {
    if (!gameIsActive || finishGameRequestRef.current) return;

    if (isEndurance) {
      if (roundCompletionRequestRef.current) return;

      roundCompletionRequestRef.current = true;
      startTransition(async () => {
        const result = await completeEnduranceRoundAction(gameInfo.gameId, gameInfo.gameState, {
          nextGamePreloaded: preparedEnduranceRound.isPrepared,
        });

        if (!result) {
          setShowCompletionMessage(true);
          roundCompletionRequestRef.current = false;
          return;
        }

        if (result.roundResult === null) {
          setCurrentGameRecord(result.gameRecord);
          setShowCompletionMessage(true);
          roundCompletionRequestRef.current = false;
          return;
        }

        if (!preparedEnduranceRound.isPrepared) {
          setCurrentGameRecord(result.gameRecord);
          if (preparedBuffer === 'primary') {
            setPrimaryGameState(result.gameState);
          } else {
            setSecondaryGameState(result.gameState);
          }
          await preparedEnduranceRound.preloadPreparedGame(result.gameState);
          const resumedGame = await resumeEnduranceGameAction(gameInfo.gameId);

          if (resumedGame) {
            setCurrentGameRecord(resumedGame);
          }
        } else {
          if (preparedBuffer === 'primary') {
            setPrimaryGameState(result.gameState);
          } else {
            setSecondaryGameState(result.gameState);
          }
          setCurrentGameRecord(result.gameRecord);
        }

        currentGameStateRef.current = result.gameState;
        setLastEnduranceRoundResult(result.roundResult);
        setActiveBuffer(preparedBuffer);

        roundCompletionRequestRef.current = false;
      });
      return;
    }

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
  }, [gameIsActive, isEndurance, preparedBuffer, preparedEnduranceRound]);

  const handleEnduranceExpire = useCallback(() => {
    if (!gameIsActive || finishGameRequestRef.current) return;

    finishGameRequestRef.current = true;
    startTransition(async () => {
      const finishedGame = await finishGameAction({
        gameId: currentGameRecord.id,
        status: 'abandoned',
        gameState: currentGameStateRef.current,
      });

      if (finishedGame) {
        setCurrentGameRecord(finishedGame);
      }

      setShowCompletionMessage(true);
    });
  }, [currentGameRecord.id, gameIsActive]);

  const handleOpenGameInfo = useCallback(() => {
    setShowGameInfo(true);

    if (!isEndurance || !gameIsActive || currentGameRecord.challengePausedAt) return;

    const pauseRequest = pauseEnduranceGameAction(currentGameRecord.id);
    gameInfoPauseRequestRef.current = pauseRequest;
    gameInfoShouldResumeRef.current = true;

    startTransition(async () => {
      const pausedGame = await pauseRequest;

      if (gameInfoPauseRequestRef.current === pauseRequest) {
        gameInfoPauseRequestRef.current = null;
      }

      if (pausedGame && gameInfoOpenRef.current) {
        setCurrentGameRecord(pausedGame);
      }
    });
  }, [currentGameRecord.challengePausedAt, currentGameRecord.id, gameIsActive, isEndurance]);

  const handleCloseGameInfo = useCallback(() => {
    setShowGameInfo(false);

    if (!isEndurance || !gameIsActive || !gameInfoShouldResumeRef.current) return;

    const pauseRequest = gameInfoPauseRequestRef.current;
    gameInfoShouldResumeRef.current = false;

    startTransition(async () => {
      if (pauseRequest) {
        await pauseRequest;
      }

      const resumedGame = await resumeEnduranceGameAction(currentGameRecord.id);

      if (resumedGame) {
        setCurrentGameRecord(resumedGame);
      }
    });
  }, [currentGameRecord.id, gameIsActive, isEndurance]);

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
        style={gameBackgroundStyle}
        className={clsx(styles.base, {
          [styles.loaded]: isLoaded,
        })}
      >
        <div className={styles.header}>
          <div className={styles.heading}>
            <div className={styles.title}>
              <FaPuzzlePiece />
              <span className={styles.titleText}>Мозаика грёз</span>
              <div className={styles.titleStats}>
                {isEndurance ? (
                  <EnduranceHud
                    game={currentGameRecord}
                    lastRoundResult={lastEnduranceRoundResult}
                    onExpire={handleEnduranceExpire}
                  />
                ) : (
                  <GameTimer game={currentGameRecord} />
                )}
              </div>
            </div>
            <Divider className={styles.divider} />
            <div className={styles.subtitle}>
              Перетаскивайте фрагменты, чтобы собрать Мозаику грёз<br />
            </div>
          </div>
          <div className={styles.actions}>
            <IconTextButton
              icon={<FaInfo />}
              className={styles.button}
              onClick={handleOpenGameInfo}
              disabled={isPending}
            >
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
        <GameInfoModal
          isOpen={showGameInfo}
          onClose={handleCloseGameInfo}
        />
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
                {isEndurance
                  ? (
                    <div>
                      Испытание завершено. Ваш рейтинг: <span className={styles.highlightGreen}>{getEnduranceRank(currentGameRecord.points ?? 0)}</span>
                    </div>
                  )
                  : currentGameRecord.status === 'abandoned'
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
              {isEndurance && (
                <>
                  <div className={styles.completionStat}>
                    <span>Очки</span>
                    <strong>{currentGameRecord.points ?? 0}</strong>
                  </div>
                  <div className={styles.completionStat}>
                    <span>Раундов</span>
                    <strong>{Math.max(0, currentGameRecord.challengeRound - 1)}</strong>
                  </div>
                </>
              )}
              <div className={styles.completionStat}>
                <span>Затраченное время</span>
                <strong>
                  <GameTimer game={currentGameRecord} variant="plain" />
                </strong>
              </div>
            </div>
          </GameCompleteModal>
        )}
        {isEndurance ? (
          <div className={styles.gameStage}>
            <div className={clsx(styles.gameLayer, {
              [styles.activeGameLayer]: activeBuffer === 'primary',
              [styles.preparedGameLayer]: activeBuffer !== 'primary',
            })}>
              <JigsawGame
                key={`primary-${primaryGameState.imageFileName}-${primaryGameState.difficulty}`}
                showStock
                dndId={`${primaryGameState.id}-primary`}
                boardClassName={styles.board}
                stockWrapperClassName={styles.stockWrapper}
                stockClassName={styles.stockFrame}
                onComplete={activeBuffer === 'primary' && gameIsActive ? handleCompleteGame : undefined}
                onGameStateChange={activeBuffer === 'primary' ? handleGameStateChange : undefined}
                {...primaryGameState}
              />
            </div>
            {secondaryGameState && (
              <div
                className={clsx(styles.gameLayer, {
                  [styles.activeGameLayer]: activeBuffer === 'secondary',
                  [styles.preparedGameLayer]: activeBuffer !== 'secondary',
                })}
                aria-hidden={activeBuffer !== 'secondary'}
              >
                <JigsawGame
                  key={`secondary-${secondaryGameState.imageFileName}-${secondaryGameState.difficulty}`}
                  showStock
                  dndId={`${secondaryGameState.id}-secondary`}
                  boardClassName={styles.board}
                  stockWrapperClassName={styles.stockWrapper}
                  stockClassName={styles.stockFrame}
                  onComplete={activeBuffer === 'secondary' && gameIsActive ? handleCompleteGame : undefined}
                  onGameStateChange={activeBuffer === 'secondary' ? handleGameStateChange : undefined}
                  {...secondaryGameState}
                />
              </div>
            )}
          </div>
        ) : (
          <JigsawGame
            key={`${activeGameState.id}-${currentGameRecord.challengeRound}-${activeGameState.imageFileName}`}
            showStock
            boardClassName={styles.board}
            stockWrapperClassName={styles.stockWrapper}
            stockClassName={styles.stockFrame}
            onComplete={gameIsActive ? handleCompleteGame : undefined}
            onGameStateChange={handleGameStateChange}
            {...activeGameState}
          />
        )}
        <div className={styles.footer}>
          <div className={styles.footerMessage}>
            Чтобы повернуть фрагмент, нажмите на него
          </div>
        </div>
      </div>
    </Suspense>
  );
}
