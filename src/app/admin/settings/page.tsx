import type { Metadata } from "next";
import { getEnduranceSettings } from "~/dal/settings";
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
  const enduranceSettings = getEnduranceSettings();

  return <AdminSettingsScreen enduranceSettings={enduranceSettings} />;
}
