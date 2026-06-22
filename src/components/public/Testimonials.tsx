"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Rina Wijaya",
    role: "Event Organizer",
    org: "Komunitas React Indonesia",
    quote: "AbsenYuk menghemat waktu kami 70% dibanding cara lama. Sangat direkomendasikan!",
    initials: "RW",
  },
  {
    name: "Budi Santoso",
    role: "Ketua Panitia",
    org: "Seminar TI Nasional",
    quote: "QR code attendance-nya sangat membantu. Peserta tinggal scan, selesai.",
    initials: "BS",
  },
  {
    name: "Sari Dewi",
    role: "Administrator",
    org: "StartupHub",
    quote: "Fitur export-nya lengkap. Laporan Excel langsung jadi tanpa repot.",
    initials: "SD",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-bold text-ink text-center mb-4">
          Apa Kata Pengguna
        </h2>
        <p className="text-ink-muted text-center mb-16 max-w-md mx-auto">
          Testimoni dari pengguna AbsenYuk di berbagai acara
        </p>
        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-bg-card rounded-xl p-6 border border-border shadow-card"
            >
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-ink leading-relaxed mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald/10 rounded-full flex items-center justify-center text-xs font-bold text-emerald">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{t.name}</p>
                  <p className="text-xs text-ink-muted">{t.role}, {t.org}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
