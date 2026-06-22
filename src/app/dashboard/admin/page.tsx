"use client";

import { useEffect, useState } from "react";
import { cacheGet, cacheSet } from "@/lib/cache";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";
import { toast } from "sonner";
import CounterRollup from "@/components/ui/CounterRollup";
import Skeleton from "@/components/ui/Skeleton";

const AdminCharts = dynamic(() => import("@/components/admin/AdminCharts"), {
  loading: () => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-bg-card rounded-2xl p-5 border border-border shadow-card">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      ))}
    </div>
  ),
});

const LiveActivityFeed = dynamic(() => import("@/components/dashboard/LiveActivityFeed"), { ssr: false });
const AlertCard = dynamic(() => import("@/components/ui/AlertCard"), { ssr: false });
const AuditLog = dynamic(() => import("@/components/dashboard/AuditLog"), { ssr: false });

interface DashboardStats {
  total_user: number;
  total_acara: number;
  total_absensi: number;
  roleStats: Array<{ role: string; count: number }>;
  eventStats: Array<{ status: string; count: number }>;
  attendanceTrend: Array<{ date: string; count: number }>;
}

const quickActions = [
  {
    label: "Tambah User",
    href: "/dashboard/admin/users",
    icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
    variant: "emerald" as const,
  },
  {
    label: "Buat Acara",
    href: "/dashboard/acara/saya",
    icon: "M12 6v6m0 0v6m0-6h6m-6 0H6",
    variant: "accent-light" as const,
  },
  {
    label: "Laporan Lengkap",
    href: "/dashboard/admin/absensi",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    variant: "accent-light" as const,
  },
];

const actionVariants: Record<string, string> = {
  emerald: "bg-emerald text-white shadow-button hover:bg-emerald-hover hover:shadow-md",
  "accent-light": "bg-card text-ink hover:bg-ink/10",
};

export default function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"7" | "30" | "all">("7");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const key = `admin:stats:${dateRange}`;
      const cached = await cacheGet<DashboardStats>(key);
      if (cached) { if (!cancelled) { setStats(cached); setLoading(false); } return; }
      try {
        const res = await fetch(`/api/dashboard/stats?range=${dateRange}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (!cancelled) { toast.error(data.error?.message || "Terjadi kesalahan. Silakan coba lagi"); setLoading(false); }
          return;
        }
        const data = await res.json();
        if (!cancelled) { setStats(data); cacheSet(key, data, 30); setLoading(false); }
      } catch { if (!cancelled) { toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda"); setLoading(false); } }
    })();
    return () => { cancelled = true; };
  }, [dateRange]);

  const roleStats = stats?.roleStats || [];
  const eventStats = stats?.eventStats || [];
  const attendanceTrend = stats?.attendanceTrend || [];

  const kpiData = [
    { value: stats?.total_user ?? 0, label: "Total Users", sub: `${roleStats.find((r) => r.role === "admin")?.count || 0} admin, ${roleStats.find((r) => r.role === "organizer")?.count || 0} organizer`, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { value: stats?.total_acara ?? 0, label: "Total Acara", sub: `${eventStats.find((e) => e.status === "berlangsung")?.count || 0} berlangsung, ${eventStats.find((e) => e.status === "akan_datang")?.count || 0} akan datang`, icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { value: stats?.total_absensi ?? 0, label: "Total Absensi", sub: "Log kehadiran tercatat", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ];

  return (
    <ErrorBoundary>
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Panel Admin</h1>
          <p className="text-sm text-ink-muted mt-0.5">Overview platform AbsenYuk</p>
        </div>
        <div className="flex gap-1.5 bg-bg-card rounded-xl p-1 border border-border">
          {(["7", "30", "all"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                dateRange === range
                  ? "bg-accent text-white shadow-button"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {range === "7" ? "7 Hari" : range === "30" ? "30 Hari" : "Semua"}
            </button>
          ))}
        </div>
      </div>

      {!loading && stats ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              {kpiData.map((kpi, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.4, ease: "easeOut" }}
                  className="bg-bg-card rounded-2xl p-5 border border-border shadow-card card-hover-enhanced"
                >
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={kpi.icon} />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-ink">
                    <CounterRollup target={kpi.value} formatFn={(n) => n.toLocaleString("id-ID")} />
                  </div>
                  <div className="text-sm font-medium text-ink mt-0.5">{kpi.label}</div>
                  <div className="text-xs text-ink-muted mt-1">{kpi.sub}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.96] ${actionVariants[action.variant]}`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                  </svg>
                  {action.label}
                </Link>
              ))}
            </div>

            <AdminCharts
              roleStats={roleStats}
              eventStats={eventStats}
              attendanceTrend={attendanceTrend}
              totalUser={stats.total_user}
              dateRange={dateRange}
            />
          </div>

          <div className="space-y-6">
            <LiveActivityFeed />
            <AlertCard />
            <AuditLog />
          </div>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-bg-card rounded-2xl p-5 border border-border shadow-card animate-pulse">
                  <div className="w-10 h-10 bg-ink/5 rounded-xl mb-3" />
                  <div className="h-8 w-20 bg-ink/5 rounded mb-2" />
                  <div className="h-4 w-28 bg-ink/5 rounded" />
                </div>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-bg-card rounded-2xl p-5 border border-border shadow-card animate-pulse">
                  <div className="h-4 w-24 bg-ink/5 rounded mb-4" />
                  <div className="h-[200px] bg-ink/5 rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-bg-card rounded-2xl p-5 border border-border shadow-card animate-pulse">
              <div className="h-4 w-28 bg-ink/5 rounded mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-ink/5 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="bg-bg-card rounded-2xl px-5 py-3 border border-border shadow-card flex items-center gap-4 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-success rounded-full animate-pulse-soft" />
          <span className="font-medium text-ink">Sistem Sehat</span>
        </div>
        <span className="text-ink-muted">|</span>
        <span className="text-ink-muted">API: <span className="font-mono text-ink">45ms</span></span>
        <span className="text-ink-muted">|</span>
        <span className="text-ink-muted">DB: <span className="font-mono text-success">OK</span></span>
      </div>
    </div>
    </ErrorBoundary>
  );
}
