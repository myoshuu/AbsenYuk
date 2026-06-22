import { prisma } from "@/lib/prisma";
import { formatTimeAgo } from "@/lib/utils";

type Activity = { icon: string; iconBg: string; text: string; time: string };

export async function getDashboardStats(role: string, userId: string) {
  if (role === "admin") {
    const [totalUser, totalAcara, totalAbsensi, roleStats, eventStats, rawLogs] = await Promise.all([
      prisma.user.count(),
      prisma.acara.count(),
      prisma.absensi.count(),
      prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
      prisma.acara.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.absensiLog.findMany({
        where: { waktuAbsen: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        select: { waktuAbsen: true },
      }),
    ]);

    const trendMap: Record<string, number> = {};
    for (const log of rawLogs) {
      const date = log.waktuAbsen.toISOString().split("T")[0];
      trendMap[date] = (trendMap[date] || 0) + 1;
    }

    return {
      total_user: totalUser,
      total_acara: totalAcara,
      total_absensi: totalAbsensi,
      roleStats: roleStats.map((r) => ({ role: r.role, count: r._count.role })),
      eventStats: eventStats.map((r) => ({ status: r.status, count: r._count.status })),
      attendanceTrend: Object.entries(trendMap).map(([date, count]) => ({ date, count })),
    };
  }

  if (role === "organizer") {
    const [totalAcara, totalPeserta, attendedUsers] = await Promise.all([
      prisma.acara.count({ where: { organizerId: userId } }),
      prisma.acaraPeserta.count({ where: { acara: { organizerId: userId } } }),
      prisma.absensiLog.groupBy({ by: ["userId"], where: { absensi: { organizerId: userId } } }),
    ]);

    return {
      total_acara: totalAcara,
      total_peserta: totalPeserta,
      rata_rata_kehadiran: totalPeserta > 0 ? Math.round((attendedUsers.length / totalPeserta) * 100) : 0,
    };
  }

  const [totalAcara, totalAbsensi] = await Promise.all([
    prisma.acaraPeserta.count({ where: { userId } }),
    prisma.absensiLog.groupBy({ by: ["absensiId"], where: { userId } }),
  ]);

  return {
    total_acara: totalAcara,
    peserta: 0,
    total_absensi: totalAbsensi.length,
  };
}

export async function getDashboardActivities(userId: string, role: string): Promise<Activity[]> {
  const activities: Activity[] = [];

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
        text: `Acara \"${a.judul}\" dibuat`,
        time: formatTimeAgo(a.createdAt),
      });
    }
  }

  const [absensi, chat] = await Promise.all([
    prisma.absensiLog.findMany({
      where: { userId },
      select: {
        waktuAbsen: true,
        keterangan: true,
        absensi: { select: { acara: { select: { judul: true } } } },
      },
      orderBy: { waktuAbsen: "desc" },
      take: 3,
    }),
    prisma.chatMessage.findMany({
      where: { userId },
      select: { message: true, createdAt: true, acara: { select: { judul: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  for (const a of absensi) {
    activities.push({
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      iconBg: a.keterangan === "hadir" ? "bg-success/10 text-success" : "bg-warning/10 text-warning",
      text: `Absensi ${a.keterangan} - ${a.absensi.acara.judul}`,
      time: formatTimeAgo(a.waktuAbsen),
    });
  }

  for (const c of chat) {
    activities.push({
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
      iconBg: "bg-accent/10 text-accent",
      text: `Pesan di \"${c.acara.judul}\"`,
      time: formatTimeAgo(c.createdAt),
    });
  }

  activities.sort((a, b) => timeScore(a.time) - timeScore(b.time));
  return activities.slice(0, 6);
}

function timeScore(label: string): number {
  if (label === "Baru saja") return 0;
  return Number.parseInt(label.replace(/[^0-9]/g, ""), 10) || 0;
}
