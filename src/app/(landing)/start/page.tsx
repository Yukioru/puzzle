import StartScreen from "~/screens/StartScreen";
import { getEnduranceSettings, getInfinitySettings } from "~/dal/settings";

export const dynamic = "force-dynamic";

export default function Start() {
  const enduranceSettings = getEnduranceSettings();
  const infinitySettings = getInfinitySettings();

  return <StartScreen enduranceSettings={enduranceSettings} infinitySettings={infinitySettings} />;
}
