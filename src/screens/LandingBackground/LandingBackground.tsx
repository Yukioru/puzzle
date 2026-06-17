'use client';

import dynamic from "next/dynamic";
import { createContext, PropsWithChildren, Suspense, use, useRef } from "react";
import { motion } from "motion/react";
import clsx from "clsx";
import { LoadingScreen } from "~/components/LoadingScreen";
import { useImageLoaderManager } from "~/hooks/useImageLoaderManager";
import { useNextJigsawGame } from "~/hooks/useNextJigsawGame";
import { IJigsawGame } from "~/types";

import styles from './LandingBackground.module.css';

const JigsawGame = dynamic(
  () => import('~/components/JigsawGame'),
  {
    ssr: false,
  }
);

interface LandingGameContextValue {
  game: IJigsawGame;
}

const LandingGameContext = createContext<LandingGameContextValue | null>(null);

interface LandingBackgroundProps extends PropsWithChildren {
  data: IJigsawGame;
}

export function useLandingGame() {
  const ctx = use(LandingGameContext);

  if (!ctx) {
    throw new Error('useLandingGame must be used inside LandingBackground');
  }

  return ctx;
}

export function LandingBackground({ data, children }: LandingBackgroundProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const {
    game,
    nextGame,
    isTransitioning,
    commitNextGame,
  } = useNextJigsawGame(data, {
    hiddenMountDelayMs: 100,
  });
  const isLoaded = useImageLoaderManager(baseRef);

  return (
    <LandingGameContext.Provider value={{ game }}>
      <Suspense fallback={<LoadingScreen seed="/" progress={25} progressMax={40} continuous />}>
        <div
          ref={baseRef}
          className={clsx(styles.base, {
            [styles.loaded]: isLoaded,
          })}
        >
          <div className={styles.gameStack}>
            <motion.div
              key={`${game.id}-${game.imageFileName}-${game.difficulty}`}
              className={styles.gameLayer}
              animate={{ opacity: isTransitioning ? 0 : 1 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
            >
              <JigsawGame
                {...game}
                showStock={false}
                boardFrameClassName={styles.boardFrame}
              />
            </motion.div>
            {nextGame && (
              <motion.div
                key={`${nextGame.id}-${nextGame.imageFileName}-${nextGame.difficulty}`}
                className={styles.gameLayer}
                initial={{ opacity: 0 }}
                animate={{ opacity: isTransitioning ? 1 : 0 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                onAnimationComplete={() => {
                  if (isTransitioning) {
                    commitNextGame();
                  }
                }}
              >
                <JigsawGame
                  {...nextGame}
                  showStock={false}
                  boardFrameClassName={styles.boardFrame}
                />
              </motion.div>
            )}
          </div>
          <div className={styles.content}>
            {children}
          </div>
        </div>
      </Suspense>
    </LandingGameContext.Provider>
  );
}
