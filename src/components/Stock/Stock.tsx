import { PropsWithChildren, ReactNode } from 'react';
import styles from './Stock.module.css';
import clsx from 'clsx';

interface StockProps {
  footer?: ReactNode;
  className?: string;
}

export function Stock({ children, footer, className }: PropsWithChildren<StockProps>) {
  return (
    <div className={clsx(styles.frame, className)}>
      <div className={styles.title}>
        Фрагменты мозаики
      </div>
      <div className={styles.base}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}