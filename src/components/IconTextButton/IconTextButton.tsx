import clsx from "clsx";
import { HTMLProps, PropsWithChildren, ReactNode } from "react";

import styles from './IconTextButton.module.css';

interface IconTextButtonProps extends Omit<HTMLProps<HTMLButtonElement>, 'size'> {
  type?: 'button' | 'submit' | 'reset';
  icon?: ReactNode;
  size?: 'medium' | 'large';
}

export function IconTextButton({
  className,
  type = 'button',
  children,
  icon,
  size = 'medium',
  ...props
}: PropsWithChildren<IconTextButtonProps>) {
  return (
    <button
      type={type}
      className={clsx(styles.base, {
        [styles[size]]: ['medium', 'large'].includes(size),
      }, className)}
      {...props}
    >
      {icon && (
        <div className={styles.icon}>
          {icon}
        </div>
      )}
      {children}
    </button>
  )  
}