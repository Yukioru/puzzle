'use client';

import { useParams } from "next/navigation";
import { LoadingScreen } from "~/components/LoadingScreen";

export default function LoadingGame() {
  const params = useParams();

  return (
    <LoadingScreen
      seed={`/game/${params.id}`}
      progress={10}
      progressMax={25}
      continuous
    />
  );
}
