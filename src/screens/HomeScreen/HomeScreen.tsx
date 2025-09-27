'use client';

import Link from "next/link";
import dynamic from "next/dynamic";
import { LoadingScreen } from "~/components/LoadingScreen";
import { Suspense } from "react";

import styles from './HomeScreen.module.css';
import { IJigsawGame } from "~/types";
import { Button } from "~/components/Button";


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
        <JigsawGame
          {...data}
          showStock={false}
          className={styles.game}
          boardFrameClassName={styles.boardFrame}
        />
        <div className={styles.overlay}>
          <h1>
            Honkai: Star Rail<br/>
            Мозаика грёз
          </h1>
          <div className={styles.footer}>
            <Button as={Link} href={`/game/${data.id}`} className={styles.button}>Начать игру</Button>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
