"use client";

import { useEffect, useState } from "react";
import CountUp from "@/components/ui/Counter";

export default function OrganizerStats() {
  const [totalAcara, setTotalAcara] = useState(0);
  const [totalPeserta, setTotalPeserta] = useState(0);
  const [rataRata, setRataRata] = useState(0);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => {
        setTotalAcara(d.total_acara ?? 0);
        setTotalPeserta(d.total_peserta ?? 0);
        setRataRata(d.rata_rata_kehadiran ?? 0);
      })
      .catch(() => {});
  }, []);

  const rateColor =
    rataRata >= 80 ? "text-emerald" : rataRata >= 50 ? "text-warning" : "text-error";

  const cards = [
    {
      value: totalAcara,
      label: "Total Acara",
      sub: "Acara yang dibuat",
      icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
      color: "text-ink",
    },
    {
      value: totalPeserta,
      label: "Partisipan",
      sub: "Total peserta bergabung",
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      color: "text-ink",
    },
    {
      value: rataRata,
      label: "Rata-rata Kehadiran",
      sub: "Persentase kehadiran",
      suffix: "%",
      color: rateColor,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-bg-card rounded-2xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.08)] border border-border hover:shadow-[0_20px_48px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
              {card.icon ? (
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )}
            </div>
            <div>
              <p className={`text-[clamp(1.4rem,2.5vw,1.8rem)] font-bold ${card.color}`}>
                <CountUp target={card.value} />
                {card.suffix || ""}
              </p>
              <p className="text-sm text-ink-muted">{card.label}</p>
              <p className="text-xs text-ink-soft mt-0.5">{card.sub}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
