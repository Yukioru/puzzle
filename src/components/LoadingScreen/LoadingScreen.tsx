import DotsDivider from "~/components/DotsDivider";
import { LoadingDots } from "./components/LoadingDots";
import { LoadingDotsBright } from "./components/LoadingDotsBright";
import { Window } from "./components/Window";
import { Line } from "./components/Line";



import styles from "./LoadingScreen.module.css";
import Image from "next/image";
import { LOADING_IMAGES, LOADING_PATH_IMAGES } from "~/constants";
import { CSSProperties, HTMLProps } from "react";
import clsx from "clsx";

interface LoadingScreenProps extends HTMLProps<HTMLDivElement> {
  seed?: string;
  progress?: number;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getRandomAssets(seed: string) {
  const hash = hashString(seed);
  const imageIndex = hash % LOADING_IMAGES.length;
  const pathImageIndex = hash % LOADING_PATH_IMAGES.length;
  const image = LOADING_IMAGES[imageIndex];
  const pathImage = LOADING_PATH_IMAGES[pathImageIndex];
  return { image, pathImage };
}

export function LoadingScreen({
  className,
  seed = Math.random().toString(),
  progress = 0,
  ...props
}: LoadingScreenProps) {
  const { image, pathImage } = getRandomAssets(seed);

  return (
    <div className={clsx(styles.base, className)} {...props}>
      <div className={styles.dotsWrapper}>
        <LoadingDots className={styles.dots} />
      </div>
      <div className={styles.dotsWrapper}>
        <LoadingDotsBright className={styles.dotsBright} />
      </div>
      <div className={styles.centerContent}>
        <div className={styles.windowWrapper}>
          {[0, 1, 2].map((i) => (
            <Window
              key={i}
              image={image.src}
              windowIndex={i}
              totalWindows={3}
              showPomPom={i === 1}
            />
          ))}
        </div>
        <Line />
      </div>
      <div className={styles.footerContent}>
        <div className={styles.loadingText}>
          <h1 className={styles.heading}>
            Загрузка...
          </h1>
          <p className={styles.text}>Сейчас мы всё загрузим</p>
        </div>
        <div className={styles.divider}>
          <DotsDivider dotColor="#403f3b" />
          <div className={styles.progressDivider} style={{ '--_progress': `${progress}%` } as CSSProperties} />
        </div>
        <Image
          src={pathImage}
          alt="Path Emblem"
          width={100}
          height={100}
          className={styles.pathIcon}
          priority
        />
      </div>
    </div>
  );
}
