import { PropsWithChildren, use } from "react";
import ReactModal from "react-modal";

import styles from './Modal.module.css';
import { GlobalContext } from "~/contexts/GlobalContext";
import clsx from "clsx";

export function Modal({ children, className, overlayClassName, ...props }: PropsWithChildren<ReactModal.Props>) {
  const ctx = use(GlobalContext);
  return (
    <ReactModal
      closeTimeoutMS={400}
      {...props}
      className={clsx(styles.modal, className)}
      overlayClassName={clsx(styles.overlay, overlayClassName)}
      appElement={ctx.rootRef.current as HTMLElement}
    >
      <div className={styles.content}>
        {children}
      </div>
    </ReactModal>
  );
}