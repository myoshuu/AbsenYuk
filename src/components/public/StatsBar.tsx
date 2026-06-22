// src/components/public/StatsBar.tsx
"use client";

import { useEffect, useState } from "react";
import CountUp from "@/components/ui/Counter";

interface PublicStats {
  total_user: number;
  total_acara: number;
  total_absensi: number;
}

export default function StatsBar() {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    fetch("/api/public/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats) return null;

  const items = [
    { value: stats.total_user, label: "Pengguna Terdaftar" },
    { value: stats.total_acara, label: "Total Acara" },
    { value: stats.total_absensi, label: "Absensi Tercatat" },
  ];

  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-[clamp(2rem,4vw,3rem)] font-bold text-ink">
                <CountUp target={item.value} />
              </p>
              <p className="text-sm text-ink-muted mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
