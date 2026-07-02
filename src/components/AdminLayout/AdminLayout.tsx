"use client";

import { PropsWithChildren, use, useCallback, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { createAdminGameAction } from "~/actions/createAdminGame";
import { ProfileSelectModal } from "~/components/ProfileSelectModal";
import { GlobalContext } from "~/contexts/GlobalContext";

import styles from "./AdminLayout.module.css";

type AdminGameMode = 'challenge' | 'infinity';

const navItems = [
  {
    href: '/admin/stats',
    label: 'Статистика',
  },
  {
    href: '/admin/settings',
    label: 'Настройки',
  },
];

export function AdminLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const ctx = use(GlobalContext);
  const [isPending, startTransition] = useTransition();

  const handleStartGame = useCallback((mode: AdminGameMode, profileId: string) => {
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
    <div className={styles.base}>
      <header className={styles.bar}>
        <Link href="/" className={styles.brand}>
          <span>Admin</span>
          <strong>Мозаика грёз</strong>
        </Link>
        <nav className={styles.nav} aria-label="Разделы админки">
          <Link
            href="/"
            className={styles.navLink}
          >
            Главная
          </Link>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(styles.navLink, {
                [styles.active]: pathname === item.href,
              })}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.launchActions}>
          <span className={styles.launchLabel}>Запуск</span>
          <ProfileSelectModal
            disabled={isPending}
            onConfirm={(profileId) => handleStartGame('infinity', profileId)}
          >
            <button
              type="button"
              className={styles.launchButton}
              disabled={isPending}
            >
              Бесконечность
            </button>
          </ProfileSelectModal>
          <ProfileSelectModal
            disabled={isPending}
            onConfirm={(profileId) => handleStartGame('challenge', profileId)}
          >
            <button
              type="button"
              className={styles.launchButton}
              disabled={isPending}
            >
              Испытание
            </button>
          </ProfileSelectModal>
        </div>
      </header>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
