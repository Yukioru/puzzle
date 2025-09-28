'use client';

import dynamic from "next/dynamic";
import { LoadingScreen } from "~/components/LoadingScreen";
import { Suspense, use, useCallback, useRef } from "react";

import styles from './HomeScreen.module.css';
import { IJigsawGame } from "~/types";
import { Button } from "~/components/Button";
import clsx from "clsx";
import { ProfileSelectModal } from "~/components/ProfileSelectModal";
import { useRouter } from "next/navigation";
import { useImageLoaderManager } from "~/hooks/useImageLoaderManager";
import { GlobalContext } from "~/contexts/GlobalContext";


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
  const homeScreenRef = useRef<HTMLDivElement>(null);
  const ctx = use(GlobalContext);
  const isLoaded = useImageLoaderManager(homeScreenRef);
  const router = useRouter();

  const handleStartGame = useCallback((profileId: string) => {
    const nextPath = `/game/${data.id}`;
    ctx.loadingScreen.toggle(true, nextPath, 40);
    router.push(`${nextPath}?profile=${profileId}`);
  }, [ctx, data.id, router]);

  return (
    <Suspense fallback={<LoadingScreen seed="/" progress={25} progressMax={40} continuous />}>
      <div
        ref={homeScreenRef}
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
