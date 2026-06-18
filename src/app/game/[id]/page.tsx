import { notFound } from "next/navigation";
import { getGameRecordById, getOrCreateGameState } from "~/dal/queries";
import GameScreen from "~/screens/GameScreen";

interface GameProps {
  params: Promise<{ id: string }>;
}

export default async function Game({ params }: Readonly<GameProps>) {
  const { id } = await params;
  const gameRecord = await getGameRecordById(id);

  if (!gameRecord) {
    notFound();
  }

  const data = await getOrCreateGameState(gameRecord);

  return <GameScreen data={data} gameRecord={gameRecord} />;
}
