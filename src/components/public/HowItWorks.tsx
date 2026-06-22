// src/components/public/HowItWorks.tsx
export default function HowItWorks() {
  const steps = [
    {
      num: "1",
      title: "Buat Acara",
      desc: "Buat acara baru dengan judul, lokasi, tanggal, dan kuota peserta.",
      icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    },
    {
      num: "2",
      title: "Upload File & Chat Grup",
      desc: "Bagikan materi acara berupa file PDF, Excel, atau Word. Diskusikan dengan peserta lewat chat grup real-time.",
      icon: "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2",
    },
    {
      num: "3",
      title: "Bagikan QR",
      desc: "Peserta scan QR code untuk melakukan absensi. Cepat dan tanpa kontak fisik.",
      icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z",
    },
    {
      num: "4",
      title: "Pantau Absensi",
      desc: "Lihat laporan kehadiran secara real-time. Export data untuk kebutuhan dokumentasi.",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-bold text-ink text-center mb-4">
          Cara Kerja
        </h2>
        <p className="text-ink-muted text-center mb-16 max-w-md mx-auto">
          Mulai kelola acara Anda dalam 4 langkah mudah
        </p>
        <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.num} className="relative text-center">
              <div className="w-14 h-14 bg-emerald/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={step.icon} />
                </svg>
              </div>
              <h3 className="font-semibold text-ink mb-2">{step.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-[60%] w-[calc(80%)] h-px bg-muted" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
