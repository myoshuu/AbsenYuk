"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-ink mb-2">Terjadi Kesalahan</h1>
        <p className="text-ink-muted mb-8">Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.</p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-emerald text-white rounded-xl font-medium shadow-button hover:bg-emerald-hover transition-all"
          >
            Coba Lagi
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-muted text-ink rounded-xl font-medium hover:bg-ink/10 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
