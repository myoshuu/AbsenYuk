export default function MissionHero() {
  return (
    <section className="pt-32 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-emerald/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-warning/5 rounded-full blur-3xl" />
      </div>
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="w-16 h-16 bg-emerald/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <svg className="w-8 h-8 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-ink tracking-tight mb-8 leading-tight">
          &ldquo;Mengubah cara Indonesia mencatat kehadiran&rdquo;
        </h1>
        <p className="text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
          AbsenYuk adalah platform absensi event berbasis QR Code yang dirancang untuk memudahkan
          pengelolaan kehadiran di berbagai acara. Dibangun dengan teknologi modern, AbsenYuk dapat digunakan
          secara gratis oleh siapa saja.
        </p>
      </div>
    </section>
  );
}
