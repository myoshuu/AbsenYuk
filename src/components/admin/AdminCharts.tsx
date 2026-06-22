"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RoleStat {
  role: string;
  count: number;
}

interface EventStat {
  status: string;
  count: number;
}

interface Trend {
  date: string;
  count: number;
}

interface AdminChartsProps {
  roleStats: RoleStat[];
  eventStats: EventStat[];
  attendanceTrend: Trend[];
  totalUser: number;
  dateRange: string;
}

export default function AdminCharts({
  roleStats,
  eventStats,
  attendanceTrend,
  totalUser,
  dateRange,
}: AdminChartsProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {roleStats.map((r) => (
              <div key={r.role} className="flex items-center justify-between text-sm">
                <span className="text-ink-muted capitalize">{r.role}</span>
                <span className="font-semibold text-ink">{r.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status Acara</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {eventStats.map((e) => (
              <div key={e.status} className="flex items-center justify-between text-sm">
                <span className="text-ink-muted capitalize">{e.status.replace(/_/g, " ")}</span>
                <span className="font-semibold text-ink">{e.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="sm:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Tren Absensi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {attendanceTrend.slice(-14).map((t) => (
              <div key={t.date} className="flex items-center justify-between text-xs">
                <span className="text-ink-muted">
                  {new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                </span>
                <span className="font-medium text-ink">{t.count}</span>
              </div>
            ))}
            {attendanceTrend.length === 0 && (
              <p className="text-xs text-ink-muted">Belum ada data absensi</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
