import { useDroppable } from "@dnd-kit/core";
import { HTMLProps, PropsWithChildren } from "react";
import clsx from "clsx";

import styles from './SystemBoard.module.css';

export function SystemBoard({ children, className, ...props }: PropsWithChildren<HTMLProps<HTMLDivElement>>) {
  const { setNodeRef } = useDroppable({
    id: 'system-board',
  });

  return (
    <div ref={setNodeRef} className={clsx(styles.base, className)} {...props}>
      {children}
    </div>
  )
}