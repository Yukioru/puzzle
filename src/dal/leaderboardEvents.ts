import db from "~/db";

type LeaderboardsListener = () => void;

interface LeaderboardsVersionRow {
  value: string;
}

const listeners = new Set<LeaderboardsListener>();
const LEADERBOARDS_VERSION_KEY = "leaderboards.version";

export function getLeaderboardsVersion() {
  const row = db.query(`
    SELECT value
    FROM app_settings
    WHERE key = $key
  `).get({ $key: LEADERBOARDS_VERSION_KEY }) as LeaderboardsVersionRow | null;

  return row?.value ?? "0";
}

export function subscribeLeaderboards(listener: LeaderboardsListener) {
  listeners.add(listener);

  return function unsubscribeLeaderboards() {
    listeners.delete(listener);
  };
}

function touchLeaderboardsVersion() {
  const now = Date.now();
  const version = `${now}:${crypto.randomUUID()}`;

  db.query(`
    INSERT INTO app_settings (key, value, updatedAt)
    VALUES ($key, $value, $updatedAt)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updatedAt = excluded.updatedAt
  `).run({
    $key: LEADERBOARDS_VERSION_KEY,
    $value: version,
    $updatedAt: now,
  });

  return version;
}

export function notifyLeaderboardsChanged() {
  touchLeaderboardsVersion();

  listeners.forEach(function notifyListener(listener) {
    listener();
  });
}
