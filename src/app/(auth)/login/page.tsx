"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/validations";
import Illustration from "@/components/ui/Illustration";

function StatBadge() {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => r.json()).then((d) => setTotal(d.total_user || 0)).catch(() => {});
  }, []);
  if (!total) return null;
  return <p className="text-xs text-ink-muted text-center mt-3">{total} pengguna terdaftar</p>;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => { fieldErrors[e.path[0] as string] = e.message; });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }
    setErrors({});

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Email atau password salah");
        setLoading(false);
        return;
      }
    } catch {
      setError("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="flex w-full max-w-5xl items-center gap-8 lg:gap-16">
        {/* Left: Illustration */}
        <div className="hidden lg:flex flex-col items-center flex-1">
          <Illustration name="hero-qr" className="max-w-xs" />
          <p className="text-ink-muted text-sm text-center mt-6 max-w-xs">
            Platform absensi event berbasis QR Code. Cepat, akurat, dan modern.
          </p>
          <StatBadge />
        </div>
        {/* Right: Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-card rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.09)] p-8 w-full">
            <h1 className="text-2xl font-bold text-ink mb-2">Masuk</h1>
            <p className="text-ink-muted mb-6">Silakan masuk ke akun Anda</p>

            {error && (
              <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-transparent focus:border-accent/30 outline-none transition-colors"
                  placeholder="user@absenyuk.id"
                  required
                />
                {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-10 bg-bg-warm rounded-xl border border-transparent focus:border-accent/30 outline-none transition-colors"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-error mt-1">{errors.password}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald text-white rounded-xl font-medium shadow-button hover:bg-emerald-hover transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            <p className="text-center text-sm text-ink-muted mt-6">
              Belum punya akun?{" "}
              <Link href="/register" className="text-accent underline">
                Daftar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
