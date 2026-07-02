import { getLeaderboardsSnapshot } from "~/dal/leaderboards";
import { getLeaderboardsVersion, subscribeLeaderboards } from "~/dal/leaderboardEvents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();
const VERSION_PROBE_INTERVAL_MS = 1000;
const KEEPALIVE_INTERVAL_MS = 15000;

type Timer = ReturnType<typeof setInterval>;

interface LeaderboardsStreamState {
  closed: boolean;
  controller: ReadableStreamDefaultController<Uint8Array>;
  lastPayload: string;
  lastVersion: string;
  versionProbeTimer: Timer | null;
  keepaliveTimer: Timer | null;
  unsubscribe: (() => void) | null;
  removeAbortListener: (() => void) | null;
}

function createSseMessage(event: string, data: string) {
  return encoder.encode(`event: ${event}\ndata: ${data}\n\n`);
}

function createSseErrorMessage(error: unknown) {
  return createSseMessage("error", JSON.stringify({
    message: error instanceof Error ? error.message : "Failed to stream leaderboards",
  }));
}

function updateKnownLeaderboardsVersion(state: LeaderboardsStreamState) {
  state.lastVersion = getLeaderboardsVersion();
}

async function pushLeaderboardsSnapshot(state: LeaderboardsStreamState) {
  const snapshot = await getLeaderboardsSnapshot();
  const payload = JSON.stringify(snapshot);

  if (state.closed || payload === state.lastPayload) return;

  state.lastPayload = payload;
  state.controller.enqueue(createSseMessage("leaderboards", payload));
}

async function pushLeaderboardsSnapshotSafely(state: LeaderboardsStreamState) {
  try {
    await pushLeaderboardsSnapshot(state);
  } catch (error) {
    if (state.closed) return;

    state.controller.enqueue(createSseErrorMessage(error));
  }
}

function pushLeaderboardsSnapshotAfterVersionChange(state: LeaderboardsStreamState) {
  const version = getLeaderboardsVersion();

  if (state.closed || version === state.lastVersion) return;

  state.lastVersion = version;
  void pushLeaderboardsSnapshotSafely(state);
}

function sendKeepalive(state: LeaderboardsStreamState) {
  if (state.closed) return;

  state.controller.enqueue(encoder.encode(": keepalive\n\n"));
}

function closeLeaderboardsStream(state: LeaderboardsStreamState) {
  if (state.closed) return;

  state.closed = true;

  if (state.keepaliveTimer) {
    clearInterval(state.keepaliveTimer);
  }

  if (state.versionProbeTimer) {
    clearInterval(state.versionProbeTimer);
  }

  state.unsubscribe?.();
  state.removeAbortListener?.();
  state.controller.close();
}

function startLeaderboardsStream(
  request: Request,
  controller: ReadableStreamDefaultController<Uint8Array>
) {
  const state: LeaderboardsStreamState = {
    closed: false,
    controller,
    lastPayload: "",
    lastVersion: getLeaderboardsVersion(),
    versionProbeTimer: null,
    keepaliveTimer: null,
    unsubscribe: null,
    removeAbortListener: null,
  };

  function closeStream() {
    closeLeaderboardsStream(state);
  }

  function handleLeaderboardsChanged() {
    updateKnownLeaderboardsVersion(state);
    void pushLeaderboardsSnapshotSafely(state);
  }

  request.signal.addEventListener("abort", closeStream, { once: true });
  state.removeAbortListener = function removeAbortListener() {
    request.signal.removeEventListener("abort", closeStream);
  };
  state.unsubscribe = subscribeLeaderboards(handleLeaderboardsChanged);
  state.versionProbeTimer = setInterval(function probeLeaderboardsVersion() {
    pushLeaderboardsSnapshotAfterVersionChange(state);
  }, VERSION_PROBE_INTERVAL_MS);
  state.keepaliveTimer = setInterval(function keepStreamAlive() {
    sendKeepalive(state);
  }, KEEPALIVE_INTERVAL_MS);

  void pushLeaderboardsSnapshotSafely(state);

  return closeStream;
}

export async function GET(request: Request) {
  let closeStream = function closeInactiveStream() {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      closeStream = startLeaderboardsStream(request, controller);
    },
    cancel() {
      closeStream();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
