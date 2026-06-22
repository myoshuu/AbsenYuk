import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { apiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin")
    return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });

  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "10")));
    const tipe = url.searchParams.get("tipe") || "";
    const offset = (page - 1) * limit;

    const where: any = { userId: session.user!.id };
    if (["acara", "absensi", "users"].includes(tipe)) {
      where.tipeData = tipe;
    }

    const [total, rows] = await Promise.all([
      prisma.exportLog.count({ where }),
      prisma.exportLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return NextResponse.json({ logs: rows, total, page, totalPages });
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
