'use client';

import { Suspense, useRef } from "react";
import { FaRegSave } from "react-icons/fa";
import { FaPuzzlePiece, FaInfo } from "react-icons/fa6";
import dynamic from "next/dynamic";
import { LoadingScreen } from "~/components/LoadingScreen";
import { IJigsawGame } from "~/types";

import styles from './GameScreen.module.css';
import { Divider } from "~/components/Divider";
import { IconTextButton } from "~/components/IconTextButton";
import clsx from "clsx";
import { useImageLoaderManager } from "~/hooks/useImageLoaderManager";

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
  const isLoaded =useImageLoaderManager(gameScreenRef);

  return (
    <Suspense fallback={<LoadingScreen seed={`/game/${data.id}`} />}>
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
            <IconTextButton icon={<FaRegSave />} className={styles.button}>
              Сохранить
            </IconTextButton>
            <IconTextButton icon={<FaInfo />} className={styles.button}>
              Правила
            </IconTextButton>
          </div>
        </div>
        <JigsawGame
          showStock
          boardClassName={styles.board}
          stockWrapperClassName={styles.stockWrapper}
          stockClassName={styles.stockFrame}
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