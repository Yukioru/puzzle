"use client";

import { PropsWithChildren, ReactNode } from "react";
import { ProfileModalLayout } from "~/components/ProfileModalLayout";
import { PROFILES } from "~/constants";
import winnings from "../../../public/winnings.json";

import styles from "./GameCompleteModal.module.css";

interface GameCompleteModalProps {
  isOpen: boolean;
  profileId: string;
  title?: ReactNode;
  footer?: ReactNode;
  showWinningMessage?: boolean;
  onRequestClose?: () => void;
}

function getProfile(profileId: string) {
  return PROFILES.find((profile) => profile.id === profileId)
    ?? PROFILES.find((profile) => profile.id === "default")!;
}

function getWinningMessage(profile: ReturnType<typeof getProfile>) {
  const winningRows = winnings as Record<string, { message: string } | undefined>;
  const factionId = profile.factions.find((item) => winningRows[item]);

  return winningRows[factionId ?? "default"]?.message
    ?? winningRows.default?.message;
}

export function GameCompleteModal({
  children,
  isOpen,
  profileId,
  title = "Игра завершена",
  footer,
  showWinningMessage = false,
  onRequestClose,
}: PropsWithChildren<GameCompleteModalProps>) {
  const profile = getProfile(profileId);
  const winningMessage = showWinningMessage
    ? getWinningMessage(profile)
    : null;

  return (
    <ProfileModalLayout
      isOpen={isOpen}
      profile={profile}
      title={title}
      footer={footer}
      onRequestClose={onRequestClose}
    >
      {winningMessage && (
        <div className={styles.winningMessage}>
          {winningMessage}
        </div>
      )}
      {children}
    </ProfileModalLayout>
  );
}
