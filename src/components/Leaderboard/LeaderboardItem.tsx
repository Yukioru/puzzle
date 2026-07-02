"use client";

import Image from "next/image";
import clsx from "clsx";
import { PROFILES } from "~/constants";
import styles from "./Leaderboard.module.css";

export interface LeaderboardItemData {
  id: string;
  profileId: string;
  meta?: string;
  value: string;
  valueCaption?: string;
}

interface LeaderboardItemProps {
  item: LeaderboardItemData;
  place: number;
}

function getProfile(profileId: string) {
  return PROFILES.find((profile) => profile.id === profileId)
    ?? PROFILES.find((profile) => profile.id === "default")!;
}

export function LeaderboardItem({ item, place }: LeaderboardItemProps) {
  const profile = getProfile(item.profileId);

  return (
    <li
      className={clsx(styles.row, {
        [styles.podium]: place <= 3,
      })}
    >
      <div className={styles.place}>{place}</div>
      <Image
        className={styles.avatar}
        src={profile.image}
        alt={profile.title}
        width={40}
        height={40}
        quality={75}
      />
      <div className={styles.player}>
        <strong>{profile.title || "Безымянный герой"}</strong>
        {item.meta && (
          <span>{item.meta}</span>
        )}
      </div>
      <div className={styles.score}>
        <strong>{item.value}</strong>
        {item.valueCaption && (
          <span>{item.valueCaption}</span>
        )}
      </div>
    </li>
  );
}
