import clsx from 'clsx';

import styles from './Divider.module.css';
import { HTMLProps } from 'react';

export function Divider({ className, ...props }: HTMLProps<HTMLDivElement>) {
  return (
    <div
      className={clsx(styles.base, className)}
      {...props}
    />
  );
}