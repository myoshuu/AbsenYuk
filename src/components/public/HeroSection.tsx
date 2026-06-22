"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import TextReveal from "@/components/ui/TextReveal";
import ProgressRing from "@/components/ui/ProgressRing";
import AnimatedBackground from "@/components/public/AnimatedBackground";

export default function HeroSection() {
  const [stats, setStats] = useState<{ total_user: number; total_acara: number; total_absensi: number } | null>(null);

  useEffect(() => {
    fetch("/api/public/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <AnimatedBackground />
      <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 bg-emerald/10 text-emerald text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Platform Absensi Digital
          </div>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-ink tracking-tight leading-[1.1]">
            <TextReveal delay={0.2}>Kelola Kehadiran</TextReveal>{" "}
            <span className="text-emerald"><TextReveal delay={0.5}>dengan Presisi.</TextReveal></span>
          </h1>
          <p className="text-lg text-ink-muted mt-6 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Platform absensi digital berbasis QR Code untuk acara dan event. Cepat, akurat, dan dilengkapi chat real-time, file sharing, serta laporan otomatis.
          </p>
          <div className="flex items-center gap-4 mt-8 justify-center lg:justify-start">
            <Link href="/register">
              <Button size="lg" className="transition-all duration-200 hover:scale-105 hover:shadow-lg bg-emerald hover:bg-emerald-hover text-white font-semibold px-6">
                Daftar Gratis
              </Button>
            </Link>
            <Link href="/fitur">
              <Button size="lg" variant="outline" className="transition-all duration-200 hover:scale-105 hover:shadow-md border-emerald/30 text-emerald hover:bg-emerald hover:text-white">
                Lihat Demo
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex-1 relative flex justify-center">
          <div className="relative">
            <svg viewBox="0 0 360 340" width="100%" height="auto" fill="none" className="max-w-sm w-full" style={{ maxWidth: 360 }}>
              <rect x="70" y="10" width="220" height="280" rx="20" stroke="currentColor" strokeWidth="2" fill="#fff" opacity="0.5" />
              <rect x="110" y="50" width="140" height="140" rx="8" fill="#111" />
              <rect x="120" y="60" width="40" height="40" rx="4" fill="#fff" />
              <rect x="200" y="60" width="40" height="40" rx="4" fill="#fff" />
              <rect x="120" y="140" width="40" height="40" rx="4" fill="#fff" />
              <rect x="200" y="100" width="20" height="20" rx="2" fill="#fff" />
              <rect x="200" y="140" width="20" height="20" rx="2" fill="#fff" />
              <rect x="160" y="100" width="20" height="20" rx="2" fill="#fff" />
              <rect x="140" y="80" width="60" height="60" rx="4" fill="#fff" />
              <rect x="160" y="60" width="20" height="20" rx="2" fill="#fff" />
              <rect x="140" y="140" width="40" height="20" rx="2" fill="#fff" />
              <rect x="160" y="120" width="60" height="20" rx="2" fill="#fff" />
              <line x1="100" y1="155" x2="260" y2="155" stroke="#1a7a4a" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
              <rect x="120" y="220" width="120" height="36" rx="18" fill="#1a7a4a" />
              <text x="180" y="243" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="600">SCAN</text>
            </svg>

            {stats && (
              <>
                <GlassCard className="absolute -top-2 -right-4 lg:-right-8">
                  <ProgressRing value={stats.total_user} size={80} strokeWidth={6} label="User" />
                </GlassCard>
                <GlassCard className="absolute -bottom-2 -left-4 lg:-left-8">
                  <ProgressRing value={stats.total_acara} size={80} strokeWidth={6} label="Acara" color="#5b8cce" />
                </GlassCard>
                <GlassCard className="absolute top-1/2 -left-12 lg:-left-20 -translate-y-1/2">
                  <ProgressRing value={stats.total_absensi} size={80} strokeWidth={6} label="Absensi" color="#e8a838" />
                </GlassCard>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex justify-center mt-16 animate-bounce">
        <svg className="w-5 h-5 text-ink-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
