"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import CountUp from "@/components/ui/Counter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";

interface Stats {
  total_acara?: number;
  total_peserta?: number;
  total_absensi?: number;
  total_user?: number;
}

interface JoinedEvent {
  id: number;
  judul: string;
  lokasi: string;
  tanggal_mulai: string;
  organizer_name: string;
}

interface Activity {
  icon: string;
  iconBg: string;
  text: string;
  time: string;
}

interface HomeData {
  stats: Stats;
  activities: Activity[];
  joined_events: JoinedEvent[];
}

export default function DashboardHomeClient({
  initialData,
  session: initialSession,
}: {
  initialData: HomeData;
  session: any;
}) {
  const { data: session } = useSession({ required: false });
  const activeSession = session || initialSession;
  const role = (activeSession?.user as any)?.role;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Selamat Pagi" : hour < 15 ? "Selamat Siang" : hour < 18 ? "Selamat Sore" : "Selamat Malam";

  const stats = initialData.stats;
  const activities = initialData.activities || [];
  const joinedEvents = initialData.joined_events || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald to-emerald/70 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-emerald/20 overflow-hidden">
          {activeSession?.user?.image ? (
            <img src={activeSession.user.image} alt="" className="w-full h-full object-cover rounded-full" />
          ) : (
            activeSession?.user?.name?.[0]?.toUpperCase() || "U"
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink">
            {greeting}, {activeSession?.user?.name}
          </h1>
          <p className="text-sm text-ink-muted capitalize">{role}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <QuickActions role={role} />
      </div>

      <StatsSection stats={stats} role={role} />

      <div className="grid lg:grid-cols-2 gap-6">
        <UpcomingEvents events={joinedEvents} />
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}

function QuickActions({ role }: { role: string }) {
  const actions = role === "user"
    ? [
        { label: "Cari Acara", href: "/dashboard/acara", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
        { label: "Acara Saya", href: "/dashboard/acara/saya", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
        { label: "Pengaturan", href: "/dashboard/profile", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
      ]
    : role === "admin"
    ? [
        { label: "Panel Admin", href: "/dashboard/admin", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
        { label: "Kelola Acara", href: "/dashboard/acara/kelola", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
        { label: "Export Data", href: "/dashboard/export", icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
      ]
    : [
        { label: "Kelola Acara", href: "/dashboard/acara/kelola", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
        { label: "Cari Acara", href: "/dashboard/acara", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
        { label: "Export Data", href: "/dashboard/export", icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
      ];

  return actions.map((action) => (
    <Link key={action.href} href={action.href}>
      <Button variant="outline" size="sm" className="gap-2 border-emerald/30 text-emerald hover:bg-emerald hover:text-white transition-all">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
        </svg>
        {action.label}
      </Button>
    </Link>
  ));
}

function StatsSection({ stats, role }: { stats: Stats; role: string }) {
  const statCards = role === "admin"
    ? [
        { label: "Total User", value: stats.total_user || 0, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
        { label: "Total Acara", value: stats.total_acara || 0, icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
        { label: "Total Absensi", value: stats.total_absensi || 0, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
      ]
    : [
        { label: "Acara Diikuti", value: stats.total_acara || 0, icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
        { label: "Peserta", value: stats.total_peserta || 0, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
        { label: "Absensi", value: stats.total_absensi || 0, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
      ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((card) => (
        <Card key={card.label} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald/10 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-ink"><CountUp target={card.value} /></p>
                <p className="text-sm text-ink-muted">{card.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UpcomingEvents({ events }: { events: JoinedEvent[] }) {
  const upcoming = events.filter((e) => new Date(e.tanggal_mulai) > new Date()).slice(0, 3);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-ink">Acara Mendatang</h2>
          <Link href="/dashboard/acara/saya" className="text-sm text-emerald hover:text-emerald-hover font-medium">
            Lihat Semua &rarr;
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-ink-muted text-center py-8">Belum ada acara mendatang</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((event) => (
              <Link key={event.id} href={`/dashboard/acara/${event.id}`}>
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-bg-warm/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{event.judul}</p>
                    <p className="text-xs text-ink-muted truncate">{event.lokasi || "Lokasi belum ditentukan"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-emerald font-medium">
                      {new Date(event.tanggal_mulai).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-ink">Aktivitas</h2>
        </div>
        {activities.length === 0 ? (
          <p className="text-sm text-ink-muted text-center py-8">Belum ada aktivitas</p>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 4).map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.iconBg}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={a.icon} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink">{a.text}</p>
                  <p className="text-xs text-ink-muted">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
