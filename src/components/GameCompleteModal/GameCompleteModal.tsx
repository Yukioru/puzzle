"use client";

import { PropsWithChildren, ReactNode } from "react";
import { ProfileModalLayout } from "~/components/ProfileModalLayout";
import { PROFILES } from "~/constants";

interface GameCompleteModalProps {
  isOpen: boolean;
  profileId: string;
  title?: ReactNode;
  footer?: ReactNode;
  onRequestClose?: () => void;
}

function getProfile(profileId: string) {
  return PROFILES.find((profile) => profile.id === profileId)
    ?? PROFILES.find((profile) => profile.id === "default")!;
}

export function GameCompleteModal({
  children,
  isOpen,
  profileId,
  title = "Игра завершена",
  footer,
  onRequestClose,
}: PropsWithChildren<GameCompleteModalProps>) {
  return (
    <ProfileModalLayout
      isOpen={isOpen}
      profile={getProfile(profileId)}
      title={title}
      footer={footer}
      onRequestClose={onRequestClose}
    >
      {children}
    </ProfileModalLayout>
  );
}
