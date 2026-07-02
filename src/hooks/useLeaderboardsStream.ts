import { useEffect, useEffectEvent, useState } from "react";
import type { LeaderboardsSnapshot } from "~/types";

function parseLeaderboardsSnapshot(data: string) {
  return JSON.parse(data) as LeaderboardsSnapshot;
}

export function useLeaderboardsStream(initialSnapshot: LeaderboardsSnapshot) {
  const [snapshot, setSnapshot] = useState(() => initialSnapshot);

  function updateSnapshotFromMessage(event: MessageEvent<string>) {
    try {
      setSnapshot(parseLeaderboardsSnapshot(event.data));
    } catch {
      // Ignore malformed SSE payloads and keep the previous snapshot.
    }
  }

  const handleMessage = useEffectEvent(updateSnapshotFromMessage);

  useEffect(() => {
    const eventSource = new EventSource("/api/leaderboards");

    eventSource.addEventListener("leaderboards", handleMessage as EventListener);

    return function closeLeaderboardsStream() {
      eventSource.close();
    };
  }, []);

  return snapshot;
}
