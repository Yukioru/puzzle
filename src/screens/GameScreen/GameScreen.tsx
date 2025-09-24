'use client';

import { IJigsawGame } from "~/types";
import styles from './GameScreen.module.css';
import dynamic from "next/dynamic";
import { LoadingScreen } from "~/components/LoadingScreen";
import { Suspense } from "react";

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
  return (
    <Suspense fallback={<LoadingScreen />}>
      <div className={styles.base}>
        <JigsawGame showStock {...data} />
      </div>
    </Suspense>
  );
}