import { Card, CardContent } from "@/components/ui/card";

export default function SocialProof() {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-bold text-ink mb-4">
          Dibangun oleh Komunitas, untuk Komunitas
        </h2>
        <p className="text-ink-muted mb-16 max-w-lg mx-auto">
          Open source, gratis selamanya, dan digunakan di seluruh Indonesia.
        </p>

        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-4">
            <CardContent>
              <div className="w-12 h-12 bg-emerald/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="font-semibold text-ink mb-1">Open Source</h3>
              <p className="text-sm text-ink-muted">Kode sumber terbuka di bawah lisensi MIT</p>
            </CardContent>
          </Card>
          <Card className="text-center p-4">
            <CardContent>
              <div className="w-12 h-12 bg-emerald/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-ink mb-1">Gratis Selamanya</h3>
              <p className="text-sm text-ink-muted">Tanpa biaya, tanpa batasan, untuk siapa saja</p>
            </CardContent>
          </Card>
          <Card className="text-center p-4">
            <CardContent>
              <div className="w-12 h-12 bg-emerald/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-ink mb-1">Digunakan Global</h3>
              <p className="text-sm text-ink-muted">Digunakan oleh berbagai organisasi di Indonesia</p>
            </CardContent>
          </Card>
        </div>

        <a
          href="https://github.com/anomalyco/absenyuk"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-6 py-4 bg-ink text-white rounded-xl hover:bg-accent-hover transition-colors shadow-button"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="font-medium">Star di GitHub</span>
          <span className="text-white/60 text-sm">MIT License</span>
        </a>

        <blockquote className="mt-10 text-ink-muted italic max-w-lg mx-auto">
          &ldquo;This is exactly what we needed for our events!&rdquo;
          <footer className="not-italic text-xs text-ink-soft mt-2">— Dari komunitas GitHub kami</footer>
        </blockquote>
      </div>
    </section>
  );
}
