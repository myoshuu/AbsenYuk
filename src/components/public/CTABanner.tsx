// src/components/public/CTABanner.tsx
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function CTABanner() {
  return (
    <section className="py-24">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-bold text-ink mb-4">
          Siap Bergabung?
        </h2>
        <p className="text-ink-muted mb-8 max-w-sm mx-auto">
          Daftar gratis dan mulai kelola acara Anda dengan AbsenYuk.
        </p>
        <Link href="/register">
          <Button size="lg" className="transition-all duration-200 hover:scale-105 hover:shadow-lg bg-emerald hover:bg-emerald-hover text-white font-semibold px-8">
            Daftar Gratis
          </Button>
        </Link>
      </div>
    </section>
  );
}
