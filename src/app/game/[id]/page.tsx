import { getGameById } from "~/dal/queries";
import GameScreen from "~/screens/GameScreen";
import { Difficulty } from "~/types";

interface GameProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ difficulty?: Difficulty }>;
}

export default async function Game({ params, searchParams }: Readonly<GameProps>) {
  const { id } = await params;
  const { difficulty } = await searchParams;

  const data = await getGameById(id, difficulty);

  return <GameScreen data={data} />;
}
