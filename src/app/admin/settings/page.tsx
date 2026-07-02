import type { Metadata } from "next";
import { getBoardSettings, getEnduranceSettings, getInfinitySettings } from "~/dal/settings";
import AdminSettingsScreen from "~/screens/AdminSettingsScreen/AdminSettingsScreen";

export const metadata: Metadata = {
  title: "Настройки | Мозаика грёз",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const boardSettings = getBoardSettings();
  const enduranceSettings = getEnduranceSettings();
  const infinitySettings = getInfinitySettings();

  return (
    <AdminSettingsScreen
      boardSettings={boardSettings}
      enduranceSettings={enduranceSettings}
      infinitySettings={infinitySettings}
    />
  );
}
