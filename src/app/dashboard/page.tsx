import { auth } from "@/auth";
import { getDashboardActivities, getDashboardStats } from "@/lib/dashboard";
import * as acaraModel from "@/models/acara";
import DashboardHomeClient from "./dashboard-home-client";

export const dynamic = "force-dynamic";

export default async function DashboardHomePage() {
  const session = await auth();
  const role = (session?.user as any)?.role || "user";
  const userId = (session?.user as any)?.id || "";

  const [stats, activities, joinedEvents] = await Promise.all([
    getDashboardStats(role, userId),
    getDashboardActivities(userId, role),
    role !== "admin" && role !== "organizer" ? acaraModel.findJoined(userId) : Promise.resolve([]),
  ]);

  const normalizedJoinedEvents = joinedEvents.map((event) => ({
    id: event.id,
    judul: event.judul,
    lokasi: event.lokasi || "Lokasi belum ditentukan",
    tanggal_mulai: event.tanggal_mulai instanceof Date ? event.tanggal_mulai.toISOString() : String(event.tanggal_mulai),
    organizer_name: event.organizer_name,
  }));

  return <DashboardHomeClient session={session} initialData={{ stats, activities, joined_events: normalizedJoinedEvents }} />;
}
