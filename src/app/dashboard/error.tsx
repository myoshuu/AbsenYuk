"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-ink mb-1">Terjadi Kesalahan</h2>
        <p className="text-sm text-ink-muted mb-6">Gagal memuat halaman ini. Silakan coba refresh.</p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset}>Coba Lagi</Button>
          <Link href="/dashboard">
            <Button variant="secondary">Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
