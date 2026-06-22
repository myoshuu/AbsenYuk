import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { apiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  try {
    const activities: { icon: string; iconBg: string; text: string; time: string }[] = [];

    if (role === "admin" || role === "organizer") {
      const where = role === "admin" ? {} : { organizerId: userId };
      const rows = await prisma.acara.findMany({
        where,
        select: { judul: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      });
      for (const a of rows) {
        activities.push({
          icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
          iconBg: "bg-info/10 text-info",
          text: `Acara "${a.judul}" dibuat`,
          time: formatTimeAgo(a.createdAt),
        });
      }
    }

    const absensi = await prisma.absensiLog.findMany({
      where: { userId },
      select: {
        waktuAbsen: true,
        keterangan: true,
        absensi: { select: { acara: { select: { judul: true } } } },
      },
      orderBy: { waktuAbsen: "desc" },
      take: 3,
    });
    for (const a of absensi) {
      activities.push({
        icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        iconBg: a.keterangan === "hadir" ? "bg-success/10 text-success" : "bg-warning/10 text-warning",
        text: `Absensi ${a.keterangan} — ${a.absensi.acara.judul}`,
        time: formatTimeAgo(a.waktuAbsen),
      });
    }

    const chat = await prisma.chatMessage.findMany({
      where: { userId },
      select: {
        message: true,
        createdAt: true,
        acara: { select: { judul: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    for (const c of chat) {
      activities.push({
        icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
        iconBg: "bg-accent/10 text-accent",
        text: `Pesan di "${c.acara.judul}"`,
        time: formatTimeAgo(c.createdAt),
      });
    }

    activities.sort((a, b) => {
      const aNum = parseInt(a.time.replace(/[^0-9]/g, "")) || 0;
      const bNum = parseInt(b.time.replace(/[^0-9]/g, "")) || 0;
      return aNum - bNum;
    });

    return NextResponse.json({ activities });
  } catch (error) {
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}

function formatTimeAgo(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}
