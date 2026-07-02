import HomeScreen from "~/screens/HomeScreen";
import { getLeaderboardsSnapshot } from "~/dal/leaderboards";

export default async function Home() {
  const snapshot = await getLeaderboardsSnapshot();

  return <HomeScreen {...snapshot} />;
}
