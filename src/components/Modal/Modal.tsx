import { PropsWithChildren, ReactNode, use } from "react";
import ReactModal from "react-modal";

import styles from './Modal.module.css';
import { GlobalContext } from "~/contexts/GlobalContext";
import clsx from "clsx";

interface ModalProps extends ReactModal.Props {
  variant?: 'content' | 'guide';
  extra?: ReactNode;
}

export function Modal({
  children,
  className,
  overlayClassName,
  variant = 'content',
  extra,
  ...props
}: PropsWithChildren<ModalProps>) {
  const ctx = use(GlobalContext);
  return (
    <ReactModal
      closeTimeoutMS={400}
      {...props}
      className={clsx(styles.modal, {
        [styles[`variant-${variant}`]]: ['content', 'guide'].includes(variant),
      }, className)}
      overlayClassName={clsx(styles.overlay, overlayClassName)}
      appElement={ctx.rootRef.current as HTMLElement}
    >
      <div className={styles.content}>
        <div className={styles.innerContent}>
          <div className={styles.container}>
            {children}
          </div>
        </div>
        {extra && (
          <div className={styles.extra}>
            {extra}
          </div>
        )}
      </div>
    </ReactModal>
  );
}