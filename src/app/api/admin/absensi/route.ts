import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { apiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin")
    return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });

  try {
    const rows = await prisma.absensiLog.findMany({
      select: {
        id: true,
        keterangan: true,
        catatan: true,
        waktuAbsen: true,
        user: { select: { username: true } },
        absensi: { select: { acara: { select: { judul: true } } } },
      },
      orderBy: { waktuAbsen: "desc" },
      take: 200,
    });
    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        keterangan: r.keterangan,
        catatan: r.catatan,
        waktu_absen: r.waktuAbsen,
        username: r.user.username,
        acara_judul: r.absensi.acara.judul,
      }))
    );
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
