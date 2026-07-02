import StartScreen from "~/screens/StartScreen";
import { getEnduranceSettings } from "~/dal/settings";

export const dynamic = "force-dynamic";

export default function Start() {
  const enduranceSettings = getEnduranceSettings();

  return <StartScreen enduranceSettings={enduranceSettings} />;
}
