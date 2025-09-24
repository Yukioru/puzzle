import { CSSProperties, HTMLProps } from "react";

import styles from '../LoadingScreen.module.css';
import clsx from "clsx";
import pomPom from '~/assets/loadings/pom-pom.webp';
import Image from "next/image";

interface WindowProps extends HTMLProps<HTMLDivElement> {
  image: string;
  windowIndex: number; // 0, 1, 2
  totalWindows: number;
  className?: string;
  showPomPom?: boolean;
}

export function Window({ image, className, windowIndex, totalWindows, showPomPom, ...props }: WindowProps) {
  const offsetPercent = (windowIndex / totalWindows) * 100;
  return (
    <div className={clsx(styles.window, className)} {...props}>
      <div className={styles.windowFrame}>
        <div
          className={styles.windowBackground}
          style={{
            backgroundImage: `url(${image})`,
            '--_offsetPercent': `${offsetPercent}%`,
            '--_windowIndex': windowIndex,
            '--_windowAnimationCycle': '1000px',
          } as CSSProperties}
        />
        {showPomPom && (
          <div className={styles.pomPomWrapper}>
            <Image
              src={pomPom}
              alt="Pom Pom"
              className={styles.pomPom}
            />
          </div>
        )}
        <div className={clsx(styles.windowStroke, styles.windowLeft)} />
        <div className={clsx(styles.windowStroke, styles.windowRight)} />
      </div>
    </div>
  );
}