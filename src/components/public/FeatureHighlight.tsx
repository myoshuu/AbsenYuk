export default function FeatureHighlight() {
  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-bold text-ink text-center mb-4">
          Fitur Utama
        </h2>
        <p className="text-ink-muted text-center mb-16 max-w-lg mx-auto">
          Semua yang Anda butuhkan untuk mengelola kehadiran peserta secara digital
        </p>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-bg-card rounded-xl p-6 border border-border shadow-card text-center">
            <div className="w-12 h-12 bg-emerald/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="font-semibold text-ink mb-2">Absensi QR</h3>
            <p className="text-sm text-ink-muted leading-relaxed">Peserta scan QR code dalam hitungan detik. Akurat dan paperless.</p>
          </div>
          <div className="bg-bg-card rounded-xl p-6 border border-border shadow-card text-center">
            <div className="w-12 h-12 bg-emerald/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-ink mb-2">Chat Real-time</h3>
            <p className="text-sm text-ink-muted leading-relaxed">Komunikasi langsung antara panitia dan peserta dalam setiap acara.</p>
          </div>
          <div className="bg-bg-card rounded-xl p-6 border border-border shadow-card text-center">
            <div className="w-12 h-12 bg-emerald/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-ink mb-2">Laporan Lengkap</h3>
            <p className="text-sm text-ink-muted leading-relaxed">Ekspor data kehadiran ke Excel atau PDF untuk dokumentasi dan audit.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
