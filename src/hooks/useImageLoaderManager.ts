import { use, useEffect, RefObject } from "react";
import { GlobalContext } from "~/contexts/GlobalContext";
import { useScopedImagesLoaded } from "./useScopedImagesLoaded";
import { usePathname } from "next/navigation";

export function useImageLoaderManager(scopeRef: RefObject<HTMLElement | null>) {
  const ctx = use(GlobalContext);
  const pathname = usePathname();
  const allImagesLoaded = useScopedImagesLoaded(scopeRef);

  useEffect(() => {
    if (!allImagesLoaded && !ctx.loadingScreen.isEnabled) {
      ctx.loadingScreen.toggle(true, { progress: 40 });
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