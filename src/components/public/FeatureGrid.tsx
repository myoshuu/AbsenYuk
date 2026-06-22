// src/components/public/FeatureGrid.tsx
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Absensi QR Code",
    desc: "Peserta scan QR unik per sesi. Absensi tercatat otomatis dan real-time.",
    icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z",
  },
  {
    title: "Multi Peran",
    desc: "Tersedia role Admin, Organizer, dan Peserta. Setiap peran memiliki akses sesuai kebutuhan.",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  },
  {
    title: "Chat Grup & File",
    desc: "Setiap acara punya chat grup real-time. Upload dan bagikan file materi acara.",
    icon: "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2",
  },
  {
    title: "Export Data",
    desc: "Download laporan absensi dalam format PDF atau Excel. Mudah untuk dokumentasi.",
    icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    title: "Upload Dokumen",
    desc: "Upload panduan, materi, atau dokumen acara. Peserta bisa download langsung.",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    title: "Gratis & Open Source",
    desc: "AbsenYuk gratis digunakan. Kode sumber terbuka untuk dikembangkan sesuai kebutuhan.",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  },
];

export default function FeatureGrid() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-bold text-ink text-center mb-4">
          Semua yang Anda Butuhkan
        </h2>
        <p className="text-ink-muted text-center mb-16 max-w-md mx-auto">
          Platform lengkap untuk mengelola absensi event Anda
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="hover:-translate-y-0.5 hover:shadow-lg transition-all p-4">
              <CardContent>
                <div className="w-11 h-11 bg-emerald/10 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-5.5 h-5.5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold text-ink mb-2">{f.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
