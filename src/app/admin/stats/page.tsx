import type { Metadata } from "next";
import { getAdminStats } from "~/dal/adminStats";
import AdminStatsScreen from "~/screens/AdminStatsScreen/AdminStatsScreen";

export const metadata: Metadata = {
  title: "Статистика | Мозаика грёз",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminStatsPage() {
  const stats = await getAdminStats();

  return <AdminStatsScreen stats={stats} />;
}
