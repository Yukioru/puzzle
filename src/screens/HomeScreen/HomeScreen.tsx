'use client';

import Link from "next/link";
import dynamic from "next/dynamic";
import { LoadingScreen } from "~/components/LoadingScreen";
import { Suspense } from "react";

import styles from './HomeScreen.module.css';
import { IJigsawGame } from "~/types";


const JigsawGame = dynamic(
  () => import('~/components/JigsawGame'),
  {
    ssr: false,
  }
);

interface HomeScreenProps {
  data: IJigsawGame;
}

export default function HomeScreen({ data }: HomeScreenProps) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <div className={styles.base}>
        <JigsawGame {...data} showStock={false} />
        <div className={styles.overlay}>
          <h1>Honkai: Star Rail - Jigsaw Puzzle</h1>
          <div className={styles.footer}>
            <Link href={`/game/${data.id}`} className={styles.button}>Начать игру</Link>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
