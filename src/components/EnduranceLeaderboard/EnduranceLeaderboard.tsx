"use client";

import { useMemo } from "react";
import Image from "next/image";
import clsx from "clsx";
import Scrollbars from "react-custom-scrollbars-2";
import { PROFILES } from "~/constants";
import { EnduranceLeaderboardEntry } from "~/types";
import { formatTime } from "~/utils/formatTime";

import styles from "./EnduranceLeaderboard.module.css";

interface EnduranceLeaderboardProps {
  entries: EnduranceLeaderboardEntry[];
}

function getProfile(profileId: string) {
  return PROFILES.find((profile) => profile.id === profileId)
    ?? PROFILES.find((profile) => profile.id === "default")!;
}

export function EnduranceLeaderboard({ entries }: EnduranceLeaderboardProps) {
  const decoratedEntries = useMemo(() => entries.map((entry, index) => ({
    ...entry,
    place: index + 1,
    profile: getProfile(entry.profileId),
  })), [entries]);

  return (
    <section className={styles.base} aria-labelledby="endurance-leaderboard-title">
      <div className={styles.header}>
        <h2 id="endurance-leaderboard-title">Зал испытаний</h2>
        <div className={styles.caption}>Лучшие игроки</div>
      </div>

      <div className={styles.viewport}>
        <Scrollbars
          universal={false}
          autoHide={false}
          autoHeight
          autoHeightMax="min(44vh, 27rem)"
          renderThumbHorizontal={() => <div />}
          renderTrackHorizontal={() => <div />}
          renderTrackVertical={() => (
            <div className={styles.scrollbarTrack} />
          )}
          renderThumbVertical={() => (
            <div className={styles.scrollbarThumb} />
          )}
        >
          {decoratedEntries.length > 0 ? (
            <ol className={styles.list}>
              {decoratedEntries.map((entry) => (
                <li
                  key={entry.gameId}
                  className={clsx(styles.row, {
                    [styles.podium]: entry.place <= 3,
                  })}
                >
                  <div className={styles.place}>{entry.place}</div>
                  <Image
                    className={styles.avatar}
                    src={entry.profile.image}
                    alt={entry.profile.title}
                    width={52}
                    height={52}
                    quality={75}
                  />
                  <div className={styles.player}>
                    <strong>{entry.profile.title || "Безымянный герой"}</strong>
                    <span>{entry.rounds} раундов · {formatTime(entry.time)}</span>
                  </div>
                  <div className={styles.score}>
                    <strong>{entry.points}</strong>
                    <span>{entry.rank}</span>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className={styles.empty}>
              Первый рекорд ещё ждёт своего героя
            </div>
          )}
        </Scrollbars>
      </div>
    </section>
  );
}
