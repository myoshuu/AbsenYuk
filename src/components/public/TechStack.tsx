import { Card, CardContent } from "@/components/ui/card";

const techs = [
  {
    name: "Next.js",
    desc: "App Router, RSC, SSR",
    icon: "M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm1-9.5h-2v5l4.5 2.5.5-.87-3-1.63V8.5z",
  },
  {
    name: "TypeScript",
    desc: "Type safety penuh",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
  {
    name: "Tailwind CSS",
    desc: "Utility-first styling",
    icon: "M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm2 4h10M7 12h10M7 16h6",
  },
  {
    name: "PostgreSQL",
    desc: "Relational database",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  },
  {
    name: "Framer Motion",
    desc: "Animasi halus",
    icon: "M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v8H8V8z",
  },
];

export default function TechStack() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-bold text-ink mb-4">
            Dibangun dengan Teknologi Modern
          </h2>
          <p className="text-ink-muted max-w-md mx-auto">
            Stack yang andal, cepat, dan siap digunakan untuk skala berapa pun.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {techs.map((t) => (
            <Card key={t.name} className="text-center p-4">
              <CardContent>
                <div className="w-10 h-10 bg-emerald/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={t.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold text-ink text-sm">{t.name}</h3>
                <p className="text-xs text-ink-muted mt-0.5">{t.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
