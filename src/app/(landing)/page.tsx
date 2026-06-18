import HomeScreen from "~/screens/HomeScreen";
import { getEnduranceLeaderboard } from "~/dal/queries";

export default async function Home() {
  const leaderboard = await getEnduranceLeaderboard();

  return <HomeScreen leaderboard={leaderboard} />;
}
