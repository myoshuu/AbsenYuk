import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalUser, totalAcara, totalAbsensi] = await Promise.all([
      prisma.user.count(),
      prisma.acara.count(),
      prisma.absensi.count(),
    ]);
    return NextResponse.json({
      total_user: totalUser,
      total_acara: totalAcara,
      total_absensi: totalAbsensi,
    }, {
      headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
