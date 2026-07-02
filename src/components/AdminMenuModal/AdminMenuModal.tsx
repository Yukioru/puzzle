"use client";

import Link from "next/link";
import { Button } from "~/components/Button";
import { Modal } from "~/components/Modal";

import styles from "./AdminMenuModal.module.css";

interface AdminMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminMenuModal({ isOpen, onClose }: AdminMenuModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      variant="guide"
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      <div className={styles.base}>
        <h2 className={styles.title}>Меню</h2>
        <div className={styles.actions}>
          <Button
            as={Link}
            href="/admin/stats"
            className={styles.button}
          >
            Статистика
          </Button>
          <Button
            as={Link}
            href="/admin/settings"
            className={styles.button}
          >
            Настройки
          </Button>
          <Button
            type="button"
            className={styles.button}
            disabled
          >
            Играть в бесконечный режим
          </Button>
          <Button
            type="button"
            className={styles.button}
            onClick={onClose}
          >
            Закрыть
          </Button>
        </div>
      </div>
    </Modal>
  );
}
