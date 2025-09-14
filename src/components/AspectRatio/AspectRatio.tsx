import { forwardRef } from "react";
import type { CSSProperties, ForwardedRef, HTMLProps, PropsWithChildren } from "react";

import styles from './AspectRatio.module.css';
import clsx from "clsx";

interface AspectRatioProps extends HTMLProps<HTMLDivElement> {
  ratio?: number;
}

function AspectRatio({
  ratio = 16 / 9,
  className,
  style = {},
  children,
  ...props
}: PropsWithChildren<AspectRatioProps>, ref: ForwardedRef<HTMLDivElement>) {
  return (
    <div
      ref={ref}
      {...props}
      className={clsx(styles.base, className)}
      style={{
        ...style,
        "--_offset": `${(1 / ratio) * 100}%`,
      } as CSSProperties}
    >
      <div className={styles.inner}>
        {children}
      </div>
    </div>
  );
}

export default forwardRef(AspectRatio); 