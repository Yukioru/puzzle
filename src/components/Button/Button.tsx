
import {
  ElementType,
  PropsWithChildren,
  ComponentPropsWithoutRef,
  HTMLProps,
  ReactNode
} from "react";

import clsx from "clsx";
import styles from './Button.module.css';

type AsProp<T extends ElementType> = {
  as?: T;
};

type ButtonProps<T extends ElementType> =
  PropsWithChildren<AsProp<T> & (
    T extends "button"
      ? HTMLProps<HTMLButtonElement>
      : ComponentPropsWithoutRef<T>
  ) & {
    variant?: "light" | "dark";
    icon?: ReactNode;
    disabled?: boolean;
  }>;

export function Button<T extends ElementType = "button">({
  as,
  children,
  className,
  variant = 'light',
  icon,
  disabled,
  ...props
}: ButtonProps<T>) {
  const Component = as || "button";
  return (
    <Component
      className={clsx(styles.base, {
        [styles[variant]]: ['light', 'dark'].includes(variant),
        [styles.disabled]: disabled,
      }, className)}
      disabled={disabled}
      {...props}
    >
      {!disabled && (
        <div className={styles.innerBorder} />
      )}
      {icon && (
        <div className={styles.icon}>{icon}</div>
      )}
      <div className={styles.child}>
        {children}
      </div>
    </Component>
  );
}
