import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { apiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { formatTimeAgo } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin")
    return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });

  try {
    const rows = await prisma.exportLog.findMany({
      select: {
        id: true,
        tipeData: true,
        format: true,
        parameter: true,
        jumlahRecord: true,
        status: true,
        createdAt: true,
        user: { select: { username: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const entries = rows.map((r) => ({
      actor: r.user.username,
      action: `Export ${r.tipeData} (${r.format})`,
      detail: r.parameter ? JSON.stringify(r.parameter) : null,
      time: formatTimeAgo(r.createdAt),
      status: r.status,
    }));

    return NextResponse.json({ entries });
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}

