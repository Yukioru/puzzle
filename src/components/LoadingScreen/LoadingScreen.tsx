import DotsDivider from "~/components/DotsDivider";
import { LoadingDots } from "./components/LoadingDots";
import { LoadingDotsBright } from "./components/LoadingDotsBright";
import { Window } from "./components/Window";
import { Line } from "./components/Line";

import hertaSpaceStation from '~/assets/loadings/loading-herta-space-station.webp';
import jariloVI from '~/assets/loadings/loading-jarilo-vi.webp';
import xianzhouLuofu from '~/assets/loadings/loading-xianzhou-luofu.webp';
import penaconyReality from '~/assets/loadings/loading-penacony-reality.webp';
import penaconyDreamscape from '~/assets/loadings/loading-penacony-dreamscape.webp';
import amphoreusDawn from '~/assets/loadings/loading-amphoreus-dawn.webp';
import amphoreusEvernight from '~/assets/loadings/loading-amphoreus-evernight.webp';

import abundance from '~/assets/paths/abundance.webp';
import destruction from '~/assets/paths/destruction.webp';
import erudition from '~/assets/paths/erudition.webp';
import harmony from '~/assets/paths/harmony.webp';
import hunt from '~/assets/paths/hunt.webp';
import nihility from '~/assets/paths/nihility.webp';
import preservation from '~/assets/paths/preservation.webp';
import remembrance from '~/assets/paths/remembrance.webp';

import styles from "./LoadingScreen.module.css";
import Image from "next/image";

const LOADING_IMAGES = [
  hertaSpaceStation,
  jariloVI,
  xianzhouLuofu,
  penaconyReality,
  penaconyDreamscape,
  amphoreusDawn,
  amphoreusEvernight,
];

const LOADING_PATH_IMAGES = [
  abundance,
  destruction,
  erudition,
  harmony,
  hunt,
  nihility,
  preservation,
  remembrance,
];

export function LoadingScreen() {
  const randomImage = LOADING_IMAGES[Math.floor(Math.random() * LOADING_IMAGES.length)];
  const randomPathImage = LOADING_PATH_IMAGES[Math.floor(Math.random() * LOADING_PATH_IMAGES.length)];

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
              image={randomImage.src}
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
          src={randomPathImage}
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
