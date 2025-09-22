import { getGameById } from "~/dal/queries";
import { JigsawGame } from "~/components/JigsawGame";

interface GameProps {
  params: Promise<{ id: string }>;
}

export default async function Game({ params }: Readonly<GameProps>) {
  const { id } = await params;

  const data = await getGameById(id);
  console.log('Game data:', data);

  return <JigsawGame showStock {...data} />;
}
