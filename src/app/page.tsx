import { getGameById } from "~/dal/queries";
import HomeScreen from "~/screens/HomeScreen";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await getGameById('test');

  return (
    <HomeScreen data={data} />
  );
}
