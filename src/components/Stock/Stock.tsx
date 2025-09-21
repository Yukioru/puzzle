import { PropsWithChildren } from 'react';
import styles from './Stock.module.css';

export function Stock({ children }: PropsWithChildren) {
  return (
    <div className={styles.outer}>
      <div className={styles.frame}>
        <div className={styles.base}>{children}</div>
      </div>
    </div>
  )
}