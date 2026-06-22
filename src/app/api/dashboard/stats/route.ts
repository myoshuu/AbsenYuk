import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { cacheGet, cacheSet } from "@/lib/cache";
import { getDashboardStats } from "@/lib/dashboard";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  const cacheKey = `dashboard:stats:${role}:${userId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  const result = await getDashboardStats(role, userId);
  await cacheSet(cacheKey, result, 300);
  return NextResponse.json(result);
}
