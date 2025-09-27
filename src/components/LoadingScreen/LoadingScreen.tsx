import DotsDivider from "~/components/DotsDivider";
import { LoadingDots } from "./components/LoadingDots";
import { LoadingDotsBright } from "./components/LoadingDotsBright";
import { Window } from "./components/Window";
import { Line } from "./components/Line";



import styles from "./LoadingScreen.module.css";
import Image from "next/image";
import { LOADING_IMAGES, LOADING_PATH_IMAGES } from "~/constants";

function getRandomAssets(seed: number) {
  const imageIndex = Math.floor(seed * LOADING_IMAGES.length);
  const pathImageIndex = Math.floor(seed * LOADING_PATH_IMAGES.length);
  const image = LOADING_IMAGES[imageIndex];
  const pathImage = LOADING_PATH_IMAGES[pathImageIndex];

  return { image, pathImage };
}

export function LoadingScreen() {
  const { image, pathImage } = getRandomAssets(Math.random());

  return (
    <div className={styles.base}>
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
        <DotsDivider dotColor="#403f3b" />
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
