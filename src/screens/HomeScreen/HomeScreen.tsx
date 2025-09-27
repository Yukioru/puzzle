'use client';

import Link from "next/link";
import dynamic from "next/dynamic";
import { LoadingScreen } from "~/components/LoadingScreen";
import { Suspense, useCallback, useEffect, useState } from "react";

import styles from './HomeScreen.module.css';
import { IJigsawGame } from "~/types";
import { Button } from "~/components/Button";
import clsx from "clsx";
import { ProfileSelectModal } from "~/components/ProfileSelectModal";
import { useRouter } from "next/navigation";


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
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 200);
  }, []);

  const handleStartGame = useCallback((profileId: string) => {
    router.push(`/game/${data.id}?profile=${profileId}`);
  }, [data.id, router]);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <div
        className={clsx(styles.base, {
          [styles.loaded]: isLoaded,
        })}
      >
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
            <ProfileSelectModal onConfirm={handleStartGame}>
              <Button className={styles.button}>Начать игру</Button>
            </ProfileSelectModal>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
