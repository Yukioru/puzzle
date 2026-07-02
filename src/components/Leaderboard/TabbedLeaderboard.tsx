"use client";

import { type ReactNode, useState } from "react";
import { Leaderboard } from "./Leaderboard";
import { LeaderboardItemData } from "./LeaderboardItem";
import styles from "./TabbedLeaderboard.module.css";

export interface TabbedLeaderboardTab<TTab extends string> {
  id: TTab;
  label: string;
  items: LeaderboardItemData[];
}

interface TabbedLeaderboardProps<TTab extends string> {
  title: string;
  emptyText: string;
  tabs: TabbedLeaderboardTab<TTab>[];
  defaultTab: TTab;
  ariaLabel: string;
  renderMeta?: (activeTab: TTab) => ReactNode;
}

export function TabbedLeaderboard<TTab extends string>({
  title,
  emptyText,
  tabs,
  defaultTab,
  ariaLabel,
  renderMeta,
}: TabbedLeaderboardProps<TTab>) {
  const [activeTab, setActiveTab] = useState<TTab>(defaultTab);
  const activeTabData = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  function selectTab(tab: TTab) {
    setActiveTab(tab);
  }

  return (
    <Leaderboard
      title={title}
      emptyText={emptyText}
      items={activeTabData?.items ?? []}
      headerAside={(
        <div className={styles.headerAside}>
          {renderMeta ? (
            <div className={styles.meta}>
              {renderMeta(activeTabData.id)}
            </div>
          ) : null}
          <div className={styles.tabs} role="tablist" aria-label={ariaLabel}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={tab.id === activeTabData.id}
                className={styles.tab}
                data-active={tab.id === activeTabData.id}
                onClick={() => selectTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
    />
  );
}
