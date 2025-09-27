import { PropsWithChildren } from "react";

import styles from './AccentIconFrame.module.css';

export function AccentIconFrame({ children}: PropsWithChildren) {
  return (
    <div className={styles.base}>
      {children}
    </div>
  )
}