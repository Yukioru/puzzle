import { RouteLoadingBridge } from "~/components/RouteLoadingBridge";

export default function LoadingHome() {
  return <RouteLoadingBridge seed="/" progress={10} />;
}
