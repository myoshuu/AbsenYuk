import dynamic from "next/dynamic";
import PublicNavbar from "@/components/layout/PublicNavbar";
import ComparisonTable from "@/components/ui/ComparisonTable";
import CTABanner from "@/components/public/CTABanner";

const FeatureTabs = dynamic(() => import("@/components/public/FeatureTabs"));

export default function FiturPage() {
  return (
    <>
      <PublicNavbar />
      <main>
        <section className="pt-32 pb-16 text-center">
          <div className="max-w-3xl mx-auto px-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald/10 text-emerald text-xs font-semibold rounded-full mb-6">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              All-in-One Platform
            </div>
            <h1 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-ink tracking-tight mb-4">
              Solusi Absensi Digital <br className="hidden sm:block" />
              untuk Semua Acara
            </h1>
            <p className="text-lg text-ink-muted max-w-xl mx-auto">
              Dari QR code hingga laporan otomatis — AbsenYuk membantu Anda mengelola kehadiran peserta dengan mudah, cepat, dan akurat.
            </p>
          </div>
        </section>

        <FeatureTabs />
        <ComparisonTable />
        <CTABanner />
      </main>
      <footer className="text-center text-sm text-ink-muted py-8 border-t border-border">
        <p>&copy; {new Date().getFullYear()} AbsenYuk. Seluruh hak cipta dilindungi.</p>
      </footer>
    </>
  );
}
