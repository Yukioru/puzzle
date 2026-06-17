'use client';

import { Suspense, use, useCallback, useRef } from "react";
import { FaDoorOpen } from "react-icons/fa";
import { FaPuzzlePiece, FaInfo } from "react-icons/fa6";
import dynamic from "next/dynamic";
import clsx from "clsx";
import Link from "next/link";
import { LoadingScreen } from "~/components/LoadingScreen";
import { IJigsawGame, IJigsawGameCompleteInfo } from "~/types";

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
}

export default function GameScreen({ data }: GameScreenProps) {
  const gameScreenRef = useRef<HTMLDivElement>(null);
  const ctx = use(GlobalContext);
  const isLoaded = useImageLoaderManager(gameScreenRef);

  function handleCompleteGame(gameInfo: IJigsawGameCompleteInfo) {
    console.log('Game completed!', gameInfo);
  }

  const handleExit = useCallback(() => {
    ctx.loadingScreen.toggle(true, { seed: '/', progress: 20 });
  }, [ctx]);

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
              Перетаскивайте фрагменты,<br />
              чтобы собрать Мозаику грёз
            </div>
          </div>
          <div className={styles.actions}>
            <IconTextButton icon={<FaInfo />} className={styles.button}>
              Правила
            </IconTextButton>
            <IconTextButton
              as={Link}
              href="/"
              icon={<FaDoorOpen />}
              className={styles.button}
              onClick={handleExit}
            >
              Выйти
            </IconTextButton>
          </div>
        </div>
        <JigsawGame
          showStock
          boardClassName={styles.board}
          stockWrapperClassName={styles.stockWrapper}
          stockClassName={styles.stockFrame}
          onComplete={handleCompleteGame}
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
