import type { CSSProperties, PropsWithChildren } from "react";

import styles from './AspectRatio.module.css';

interface AspectRatioProps {
  ratio?: number;
}

export function AspectRatio({ ratio = 16 / 9, children }: PropsWithChildren<AspectRatioProps>) {
  return (
    <div
      className={styles.base}
      style={{
        "--_offset": `${(1 / ratio) * 100}%`,
      } as CSSProperties}
    >
      <div className={styles.inner}>
        {children}
      </div>
    </div>
  );
}