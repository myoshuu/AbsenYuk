"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  {
    key: "attendance",
    label: "Kehadiran",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    features: [
      "Scan QR Code — Peserta scan QR unik per sesi",
      "Multi-Sesi — Sesi absensi berganda dalam satu acara",
      "Real-time — Kehadiran tercatat dan terlihat langsung",
      "Override Manual — Opsi input manual untuk kasus khusus",
    ],
  },
  {
    key: "communication",
    label: "Komunikasi",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    features: [
      "Chat Grup — Diskusi real-time per acara",
      "File Sharing — Upload dan download materi",
      "Notifikasi — Info update langsung ke peserta",
    ],
  },
  {
    key: "management",
    label: "Manajemen",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    features: [
      "Buat Acara — Form lengkap dengan validasi",
      "Kelola Peserta — Tambah/hapus peserta, cek kapasitas",
      "Role-Based — Admin, Organizer, User dengan akses berbeda",
    ],
  },
  {
    key: "reporting",
    label: "Laporan",
    icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    features: [
      "Export PDF — Laporan siap cetak",
      "Export Excel — Data mentah untuk analisis lanjutan",
      "Analitik — Grafik kehadiran real-time",
    ],
  },
];

export default function FeatureTabs() {
  const [active, setActive] = useState("attendance");

  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-bold text-ink text-center mb-4">
          Fitur Lengkap untuk Setiap Kebutuhan
        </h2>
        <p className="text-ink-muted text-center mb-12 max-w-md mx-auto">
            Setiap fitur dirancang untuk pengalaman absensi yang mulus
        </p>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActive(cat.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active === cat.key
                  ? "bg-emerald text-white shadow-button"
                  : "bg-muted text-ink-muted hover:text-ink hover:bg-ink/10"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cat.icon} />
              </svg>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {categories.filter((c) => c.key === active).map((cat) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-card"
            >
              <div className="flex items-start gap-2 mb-4">
                <div className="w-10 h-10 bg-emerald/10 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cat.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-ink text-lg">{cat.label}</h3>
                  <p className="text-sm text-ink-muted">{cat.features.length} fitur tersedia</p>
                </div>
              </div>
              <ul className="space-y-3">
                {cat.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-ink">
                    <svg className="w-4 h-4 text-emerald mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
