import { use, useEffect, RefObject } from "react";
import { GlobalContext } from "~/contexts/GlobalContext";
import { ScopedImagesLoadedOptions, useScopedImagesLoaded } from "./useScopedImagesLoaded";
import { usePathname } from "next/navigation";

export function useImageLoaderManager(
  scopeRef?: RefObject<HTMLElement | null>,
  options?: ScopedImagesLoadedOptions,
) {
  const ctx = use(GlobalContext);
  const pathname = usePathname();
  const allImagesLoaded = useScopedImagesLoaded(scopeRef, options);

  useEffect(() => {
    if (!allImagesLoaded) {
      const nextProgress = Math.max(ctx.loadingScreen.progress ?? 0, 40);

      if (
        !ctx.loadingScreen.isEnabled ||
        ctx.loadingScreen.seed !== pathname ||
        (ctx.loadingScreen.progress ?? 0) < nextProgress
      ) {
        ctx.loadingScreen.toggle(true, { seed: pathname, progress: nextProgress });
      }
      return;
    }

    if (
      allImagesLoaded &&
      ctx.loadingScreen.seed === pathname &&
      ctx.loadingScreen.isEnabled
    ) {
      ctx.loadingScreen.toggle(false, { progress: 100 });
    }
  }, [allImagesLoaded, ctx, pathname]);

  return allImagesLoaded;
}
