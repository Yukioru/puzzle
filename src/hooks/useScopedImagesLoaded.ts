import { useEffect, useState, RefObject } from "react";
import { createScopedLoader } from "~/utils/imageLoaderManager";

const initialLoadQuietMs = 120;
const paintFramesAfterLoad = 3;

export interface ScopedImagesLoadedOptions {
  minTrackedCount?: number;
}

function waitForPaintFrames(count: number) {
  return new Promise<void>((resolve) => {
    const tick = (remaining: number) => {
      if (remaining <= 0) {
        resolve();
        return;
      }

      requestAnimationFrame(() => tick(remaining - 1));
    };

    tick(count);
  });
}

export function useScopedImagesLoaded(
  rootRef?: RefObject<HTMLElement | null>,
  { minTrackedCount = 1 }: ScopedImagesLoadedOptions = {},
) {
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    if (!rootRef) {
      setAllLoaded(true);
      return;
    }

    let stopObserve: (() => void) | null = null;
    let rafId: number | null = null;
    let readyTimeoutId: number | null = null;
    let initialLoadCompleted = false;
    let isActive = true;

    const onLoadingStatusChange = ({
      allLoaded: isLoaded,
      trackedCount,
    }: {
      allLoaded: boolean;
      trackedCount: number;
    }) => {
      if (readyTimeoutId !== null) {
        window.clearTimeout(readyTimeoutId);
        readyTimeoutId = null;
      }

      if (!isLoaded || trackedCount < minTrackedCount) {
        if (!initialLoadCompleted) {
          setAllLoaded(false);
        }
        return;
      }

      readyTimeoutId = window.setTimeout(() => {
        waitForPaintFrames(paintFramesAfterLoad).then(() => {
          if (!isActive || readyTimeoutId === null) return;

          initialLoadCompleted = true;
          setAllLoaded(true);
        });
      }, initialLoadQuietMs);
    };

    setAllLoaded(false);

    const init = () => {
      const root = rootRef.current;
      if (!root) return false;

      const loader = createScopedLoader(root);
      loader.addStatusListener(onLoadingStatusChange);
      stopObserve = loader.observe();
      return true;
    };

    if (!init()) {
      // ждём появления DOM-узла через RAF
      const tick = () => {
        if (!init()) {
          rafId = requestAnimationFrame(tick);
        }
      };
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      isActive = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (readyTimeoutId !== null) {
        window.clearTimeout(readyTimeoutId);
        readyTimeoutId = null;
      }
      stopObserve?.();
    };
  }, [minTrackedCount, rootRef]);

  return allLoaded;
}
