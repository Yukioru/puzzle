import HomeScreen from "~/screens/HomeScreen";
import { getEnduranceLeaderboard } from "~/dal/queries";
import { getEnduranceSettings } from "~/dal/settings";

export default async function Home() {
  const leaderboard = await getEnduranceLeaderboard();
  const enduranceSettings = getEnduranceSettings();

  return <HomeScreen leaderboard={leaderboard} enduranceSettings={enduranceSettings} />;
}
