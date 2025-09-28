'use client';

import { usePathname } from "next/navigation";
import { LoadingScreen } from "~/components/LoadingScreen";

export default function LoadingGame() {
  const pathname = usePathname();

  return <LoadingScreen seed={pathname} progress={10} progressMax={25} continuous />;
}
