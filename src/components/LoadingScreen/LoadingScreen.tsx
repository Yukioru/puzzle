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
import elation from '~/assets/paths/elation.webp';
import enigmata from '~/assets/paths/enigmata.webp';
import equilibrium from '~/assets/paths/equilibrium.webp';
import erudition from '~/assets/paths/erudition.webp';
import harmony from '~/assets/paths/harmony.webp';
import hunt from '~/assets/paths/hunt.webp';
import nihility from '~/assets/paths/nihility.webp';
import order from '~/assets/paths/order.webp';
import preservation from '~/assets/paths/preservation.webp';
import propagation from '~/assets/paths/propagation.webp';
import remembrance from '~/assets/paths/remembrance.webp';
import trailblaze from '~/assets/paths/trailblaze.webp';
import voracity from '~/assets/paths/voracity.webp';

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
  elation,
  enigmata,
  equilibrium,
  erudition,
  harmony,
  hunt,
  nihility,
  order,
  preservation,
  propagation,
  remembrance,
  trailblaze,
  voracity,
];

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
