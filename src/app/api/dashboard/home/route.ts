import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { cacheGet, cacheSet } from "@/lib/cache";
import { getDashboardActivities, getDashboardStats } from "@/lib/dashboard";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  const cacheKey = `dashboard:home:${role}:${userId}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const [stats, activities, joinedEvents] = await Promise.all([
      getDashboardStats(role, userId),
      getDashboardActivities(userId, role),
      role !== "admin" && role !== "organizer" ? import("@/models/acara").then((m) => m.findJoined(userId)) : Promise.resolve([]),
    ]);

    const result = { stats, activities, joined_events: joinedEvents };
    await cacheSet(cacheKey, result, 300);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: { message: "Gagal memuat dashboard" } }, { status: 500 });
  }
}
