"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "Bagaimana cara mendaftar akun?",
    a: "Kunjungi halaman Registrasi, isi data diri seperti nama, email, dan password. Setelah terdaftar, Anda bisa langsung login dan mulai membuat atau mengikuti acara.",
  },
  {
    q: "Apakah AbsenYuk benar-benar gratis?",
    a: "Ya, AbsenYuk dapat digunakan secara gratis. Fitur dasar selalu gratis, dan kami menyediakan opsi untuk kebutuhan skala besar.",
  },
  {
    q: "Bagaimana cara membuat acara baru?",
    a: "Masuk ke dashboard, klik \"Buat Acara\", lalu isi judul, deskripsi, lokasi, tanggal, dan kuota peserta. Acara akan langsung aktif dan bisa diikuti peserta.",
  },
  {
    q: "Apa yang terjadi jika peserta lupa absen?",
    a: "Absensi hanya bisa dilakukan saat sesi dibuka oleh organizer. Jika terlewat, hubungi organizer untuk mendapatkan status kehadiran yang sesuai.",
  },
  {
    q: "Bisakah data absensi diekspor?",
    a: "Tentu. Organizer dan admin dapat mengekspor laporan kehadiran dalam format Excel atau PDF melalui halaman detail acara.",
  },
];

export default function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (i: number) => setOpen(open === i ? null : i);

  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-bold text-ink text-center mb-4">
          Pertanyaan Umum
        </h2>
        <p className="text-ink-muted text-center mb-16 max-w-md mx-auto">
          Temukan jawaban dari pertanyaan yang sering diajukan
        </p>
        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="bg-bg-card rounded-xl shadow-card overflow-hidden">
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left text-ink font-medium"
                >
                  <span>{faq.q}</span>
                  <motion.svg
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="w-5 h-5 text-ink-muted shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-sm text-ink-muted leading-relaxed">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
