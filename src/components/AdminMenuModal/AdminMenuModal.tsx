"use client";

import { use, useCallback, useTransition } from "react";
import Link from "next/link";
import { createAdminGameAction } from "~/actions/createAdminGame";
import { Button } from "~/components/Button";
import { Modal } from "~/components/Modal";
import { ProfileSelectModal } from "~/components/ProfileSelectModal";
import { GlobalContext } from "~/contexts/GlobalContext";

import styles from "./AdminMenuModal.module.css";

interface AdminMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminMenuModal({ isOpen, onClose }: AdminMenuModalProps) {
  const ctx = use(GlobalContext);
  const [isPending, startTransition] = useTransition();

  const handleStartGame = useCallback((mode: 'challenge' | 'infinity', profileId: string) => {
    const id = `${Date.now()}${Math.random()}`;
    const gameUrl = `/game/${id}`;

    ctx.loadingScreen.toggle(true, { seed: gameUrl, progress: 20 });
    startTransition(async () => {
      await createAdminGameAction({
        id,
        profileId,
        mode,
      });
    });
  }, [ctx]);

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
          <ProfileSelectModal
            disabled={isPending}
            onConfirm={(profileId) => handleStartGame('infinity', profileId)}
          >
            <Button
              type="button"
              className={styles.button}
              disabled={isPending}
            >
              Игра: бесконечная
            </Button>
          </ProfileSelectModal>
          <ProfileSelectModal
            disabled={isPending}
            onConfirm={(profileId) => handleStartGame('challenge', profileId)}
          >
            <Button
              type="button"
              className={styles.button}
              disabled={isPending}
            >
              Игра: испытание
            </Button>
          </ProfileSelectModal>
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
