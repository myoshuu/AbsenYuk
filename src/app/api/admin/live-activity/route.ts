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
    const [users, acara, absensi] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, username: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.acara.findMany({
        select: { id: true, judul: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.absensiLog.findMany({
        select: {
          waktuAbsen: true,
          keterangan: true,
          user: { select: { username: true } },
          absensi: { select: { acara: { select: { judul: true } } } },
        },
        orderBy: { waktuAbsen: "desc" },
        take: 5,
      }),
    ]);

    const activities: {
      type: string;
      label: string;
      time: string;
      icon: string;
      color: string;
    }[] = [];

    for (const u of users) {
      activities.push({
        type: "user_baru",
        label: `Pengguna baru: ${u.username}`,
        time: formatTimeAgo(u.createdAt),
        icon: "user",
        color: "info",
      });
    }

    for (const a of acara) {
      activities.push({
        type: "acara_baru",
        label: `Acara baru: ${a.judul}`,
        time: formatTimeAgo(a.createdAt),
        icon: "calendar",
        color: "accent",
      });
    }

    for (const a of absensi) {
      const labelMap: Record<string, string> = {
        hadir: "hadir",
        sakit: "sakit",
        izin: "izin",
        terlambat: "terlambat",
        tanpa_keterangan: "tanpa keterangan",
      };
      activities.push({
        type: "absensi_masuk",
        label: `${a.user.username} ${labelMap[a.keterangan] || a.keterangan} — ${a.absensi.acara.judul}`,
        time: formatTimeAgo(a.waktuAbsen),
        icon: "check",
        color: a.keterangan === "hadir" ? "success" : "warning",
      });
    }

    activities.sort((a, b) => {
      const aVal = parseTimeAgo(a.time);
      const bVal = parseTimeAgo(b.time);
      return aVal - bVal;
    });

    return NextResponse.json({ activities: activities.slice(0, 10) });
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}

function parseTimeAgo(time: string): number {
  if (time === "Baru saja") return 0;
  const match = time.match(/(\d+)/);
  return match ? parseInt(match[1]) : 999;
}

