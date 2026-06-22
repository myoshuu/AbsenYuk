import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-ink/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-7xl font-bold text-ink/10 mb-2">404</h1>
        <p className="text-xl text-ink font-semibold mb-2">Halaman tidak ditemukan</p>
        <p className="text-ink-muted mb-8">Halaman yang Anda cari mungkin telah dipindahkan atau tidak tersedia.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="px-6 py-3 bg-emerald text-white rounded-xl font-medium shadow-button hover:bg-emerald-hover transition-all">
            Kembali ke Beranda
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-muted text-ink rounded-xl font-medium hover:bg-ink/10 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
