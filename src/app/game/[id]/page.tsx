import { getGameById } from "~/dal/queries";
import { redirect } from "next/navigation";
import { JigsawGame } from "~/components/JigsawGame";

interface GameProps {
  params: Promise<{ id: string }>;
}

export default async function Game({ params }: Readonly<GameProps>) {
  const { id } = await params;

  if (!id) {
    redirect('/');
  }

  const data = await getGameById(id);
  console.log('Game data:', data);

  return <JigsawGame {...data} />;
}
