import { Card, CardContent } from "@/components/ui/card";

const rows = [
  { aspect: "Waktu", manual: "15-30 menit", absen: "Instan" },
  { aspect: "Akurasi", manual: "Rentan kesalahan", absen: "99.9%" },
  { aspect: "Laporan", manual: "Input manual", absen: "Auto-generated" },
  { aspect: "Biaya", manual: "Kertas + tenaga", absen: "Gratis" },
];

export default function ComparisonTable() {
  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-bold text-ink text-center mb-4">
          Absensi Manual vs AbsenYuk
        </h2>
        <p className="text-ink-muted text-center mb-12 max-w-md mx-auto">
          Lihat perbedaan efisiensi sebelum dan sesudah menggunakan AbsenYuk
        </p>
        <Card className="p-4">
          <CardContent>
            <div className="divide-y divide-black/5">
            <div className="grid grid-cols-3 gap-4 pb-3 mb-3">
              <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Aspek</div>
              <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider text-center">Manual</div>
              <div className="text-xs font-semibold text-emerald uppercase tracking-wider text-center">AbsenYuk</div>
            </div>
            {rows.map((row) => (
              <div key={row.aspect} className="grid grid-cols-3 gap-4 py-3">
                <div className="text-sm font-medium text-ink">{row.aspect}</div>
                <div className="text-sm text-ink-muted text-center">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {row.manual}
                  </span>
                </div>
                <div className="text-sm text-emerald font-medium text-center">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {row.absen}
                  </span>
                </div>
              </div>
            ))}
          </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
