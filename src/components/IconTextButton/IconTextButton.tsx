import clsx from "clsx";
import {
  ComponentPropsWithoutRef,
  ElementType,
  PropsWithChildren,
  ReactNode,
} from "react";

import styles from './IconTextButton.module.css';

type AsProp<T extends ElementType> = {
  as?: T;
};

type IconTextButtonProps<T extends ElementType> =
  PropsWithChildren<AsProp<T> & (
    T extends "button"
      ? Omit<ComponentPropsWithoutRef<"button">, 'size'>
      : ComponentPropsWithoutRef<T>
  ) & {
    type?: 'button' | 'submit' | 'reset';
    icon?: ReactNode;
    size?: 'small' | 'medium' | 'large';
  }>;

export function IconTextButton<T extends ElementType = "button">({
  as,
  className,
  type = 'button',
  children,
  icon,
  size = 'medium',
  ...props
}: IconTextButtonProps<T>) {
  const Component = as || "button";

  return (
    <Component
      {...(Component === "button" ? { type } : {})}
      className={clsx(styles.base, {
        [styles[size]]: ['small', 'medium', 'large'].includes(size),
      }, className)}
      {...props}
    >
      {icon && (
        <div className={styles.icon}>
          {icon}
        </div>
      )}
      {children}
    </Component>
  )  
}
