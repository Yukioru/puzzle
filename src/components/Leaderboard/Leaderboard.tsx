"use client";

import { ReactNode } from "react";
import Scrollbars from "react-custom-scrollbars-2";
import styles from "./Leaderboard.module.css";
import { LeaderboardItem, LeaderboardItemData } from "./LeaderboardItem";

interface LeaderboardProps {
  title: string;
  caption?: string;
  emptyText: string;
  items: LeaderboardItemData[];
  headerAside?: ReactNode;
}

export function Leaderboard({
  title,
  caption,
  emptyText,
  items,
  headerAside,
}: LeaderboardProps) {
  const titleId = `${title.toLowerCase().replace(/\s+/g, "-")}-leaderboard-title`;

  return (
    <section className={styles.base} aria-labelledby={titleId}>
      <div className={styles.header}>
        <h2 id={titleId}>{title}</h2>
        {headerAside ?? (caption ? <div className={styles.caption}>{caption}</div> : null)}
      </div>

      <div className={styles.viewport}>
        <Scrollbars
          universal
          autoHide
          className={styles.scrollbar}
          renderThumbHorizontal={() => <div />}
          renderTrackHorizontal={() => <div />}
        >
          {items.length > 0 ? (
            <ol className={styles.list}>
              {items.map((item, index) => (
                <LeaderboardItem
                  key={item.id}
                  item={item}
                  place={index + 1}
                />
              ))}
            </ol>
          ) : (
            <div className={styles.empty}>
              {emptyText}
            </div>
          )}
        </Scrollbars>
      </div>
    </section>
  );
}
