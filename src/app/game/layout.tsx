import type { PropsWithChildren } from "react";

import styles from './layout.module.css';

export default function GameLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <div className={styles.base}>
      {children}
    </div>
  );
}
