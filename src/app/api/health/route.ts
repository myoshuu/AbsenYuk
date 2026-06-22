import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: "MB"
    },
    database: await checkDatabase(),
  };

  const healthy = checks.database === "connected";
  const status = healthy ? 200 : 503;

  return NextResponse.json(checks, { status });
}

async function checkDatabase(): Promise<string> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "connected";
  } catch (error) {
    return "disconnected";
  }
}
