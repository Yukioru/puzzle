import { PropsWithChildren, ReactNode } from 'react';
import styles from './Stock.module.css';

interface StockProps {
  footer?: ReactNode;
}

export function Stock({ children, footer }: PropsWithChildren<StockProps>) {
  return (
    <div className={styles.frame}>
      <div className={styles.base}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}