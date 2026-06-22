"use client";

import { useEffect, useState } from "react";

type AlertType = "success" | "warning" | "error";

interface Alert {
  type: AlertType;
  title: string;
  message: string;
}

interface StatsResponse {
  total_user?: number;
  total_acara?: number;
  total_absensi?: number;
  eventStats?: { status: string; count: number }[];
}

const icons: Record<AlertType, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const styles: Record<AlertType, string> = {
  success: "bg-success/10 border-success/30 text-success",
  warning: "bg-warning/10 border-warning/30 text-warning",
  error: "bg-error/10 border-error/30 text-error",
};

export default function AlertCard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data: StatsResponse) => {
        const list: Alert[] = [];

        if (data.eventStats) {
          const dibatalkan = data.eventStats.find((s) => s.status === "dibatalkan");
          if (dibatalkan && dibatalkan.count > 0) {
            list.push({
              type: "warning",
              title: "Acara Dibatalkan",
              message: `${dibatalkan.count} acara telah dibatalkan. Perlu ditinjau.`,
            });
          }
          const selesai = data.eventStats.find((s) => s.status === "selesai");
          if (selesai && selesai.count > 0) {
            list.push({
              type: "success",
              title: "Acara Selesai",
              message: `${selesai.count} acara telah selesai dilaksanakan.`,
            });
          }
        }

        if (data.total_user !== undefined) {
          list.push({
            type: "success",
            title: "Total Pengguna",
            message: `${data.total_user} pengguna terdaftar di sistem.`,
          });
        }

        if (data.total_acara !== undefined && data.total_acara > 0) {
          list.push({
            type: "success",
            title: "Total Acara",
            message: `${data.total_acara} acara tersedia.`,
          });
        }

        setAlerts(list);
      })
      .catch(() => {});
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 rounded-xl border p-4 ${styles[alert.type]}`}
        >
          <span className="mt-0.5 shrink-0">{icons[alert.type]}</span>
          <div>
            <p className="text-sm font-semibold">{alert.title}</p>
            <p className="text-sm opacity-80">{alert.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
