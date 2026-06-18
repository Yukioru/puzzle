"use client";

import { use, useEffect } from "react";
import { GlobalContext } from "~/contexts/GlobalContext";

interface RouteLoadingBridgeProps {
  seed: string;
  progress?: number;
}

export function RouteLoadingBridge({ seed, progress = 10 }: RouteLoadingBridgeProps) {
  const ctx = use(GlobalContext);

  useEffect(() => {
    ctx.loadingScreen.toggle(true, { seed, progress });
  }, [ctx, progress, seed]);

  return null;
}
