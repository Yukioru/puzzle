import { useEffect, useState, RefObject } from "react";
import { createScopedLoader } from "~/utils/imageLoaderManager";

export function useScopedImagesLoaded(rootRef: RefObject<HTMLElement | null>) {
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    let stopObserve: (() => void) | null = null;
    let rafId: number | null = null;
    const onAllLoaded = () => {
      setAllLoaded(true);
    };

    setAllLoaded(false);

    const init = () => {
      const root = rootRef.current;
      if (!root) return false;

      const loader = createScopedLoader(root);
      loader.addListener(onAllLoaded);
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
      if (rafId !== null) cancelAnimationFrame(rafId);
      stopObserve?.();
    };
  }, [rootRef]);

  return allLoaded;
}