import { LoadingScreen } from "~/components/LoadingScreen";

export default async function LoadingHome() {
  return <LoadingScreen seed="/" progress={10} progressMax={25} continuous />;
}
