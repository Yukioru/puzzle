'use client';

import { useParams } from "next/navigation";
import { RouteLoadingBridge } from "~/components/RouteLoadingBridge";

export default function LoadingGame() {
  const params = useParams();

  return <RouteLoadingBridge seed={`/game/${params.id}`} progress={10} />;
}
