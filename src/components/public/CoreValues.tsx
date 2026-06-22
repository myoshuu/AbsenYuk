import { Card, CardContent } from "@/components/ui/card";

const values = [
  {
    title: "Open Source",
    desc: "Kode sumber terbuka untuk semua. Transparan dan dapat dikembangkan oleh siapa saja.",
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  },
  {
    title: "Simplicity First",
    desc: "Mudah digunakan, tanpa ribet. Fokus pada pengalaman pengguna yang intuitif.",
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  },
  {
    title: "Privacy-First",
    desc: "Data Anda adalah prioritas kami. Keamanan dan privasi tidak bisa ditawar.",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  },
  {
    title: "Community Driven",
    desc: "Dibangun oleh komunitas, untuk komunitas. Setiap kontribusi berarti.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
];

export default function CoreValues() {
  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-bold text-ink text-center mb-4">
          Nilai-Nilai Kami
        </h2>
        <p className="text-ink-muted text-center mb-16 max-w-md mx-auto">
          Prinsip yang menjadi fondasi setiap keputusan
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <Card key={v.title} className="text-center p-4">
              <CardContent>
                <div className="w-12 h-12 bg-emerald/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={v.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold text-ink mb-2">{v.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{v.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
