import { getGameById } from "~/dal/queries";
import GameScreen from "~/screens/GameScreen";

interface GameProps {
  params: Promise<{ id: string }>;
}

export default async function Game({ params }: Readonly<GameProps>) {
  const { id } = await params;

  const data = await getGameById(id);

  return <GameScreen data={data} />;
}
