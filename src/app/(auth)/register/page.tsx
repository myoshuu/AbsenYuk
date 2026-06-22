"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema } from "@/lib/validations";
import Illustration from "@/components/ui/Illustration";
import { Button } from "@/components/ui/Button";

function passwordStrength(pw: string): { score: number; label: string; color: string; width: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;

  if (score <= 2) return { score, label: "Lemah", color: "bg-error", width: "w-1/3" };
  if (score <= 4) return { score, label: "Sedang", color: "bg-warning", width: "w-2/3" };
  return { score, label: "Kuat", color: "bg-emerald", width: "w-full" };
}

function StatBadge() {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => r.json()).then((d) => setTotal(d.total_user || 0)).catch(() => {});
  }, []);
  if (!total) return null;
  return <p className="text-xs text-ink-muted text-center mt-3">{total} pengguna terdaftar</p>;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "user" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => passwordStrength(form.password), [form.password]);

  function handleNextStep() {
    const errs: Record<string, string> = {};
    if (!form.username.trim() || form.username.length < 3) errs.username = "Username minimal 3 karakter";
    if (!form.email.trim()) errs.email = "Email wajib diisi";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => { fieldErrors[e.path[0] as string] = e.message; });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }
    setErrors({});

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || "Terjadi kesalahan. Silakan coba lagi");
        setLoading(false);
        return;
      }
    } catch {
      setError("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
      setLoading(false);
      return;
    }

    setStep(3);
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
            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    step >= s ? "bg-emerald text-white" : "bg-muted text-ink-muted"
                  }`}>{s}</div>
                  <span className={`text-xs ${step >= s ? "text-ink" : "text-ink-muted"} hidden sm:inline`}>
                    {s === 1 ? "Buat Akun" : s === 2 ? "Lengkapi Data" : "Selesai"}
                  </span>
                  {s < 3 && <div className={`flex-1 h-px ${step > s ? "bg-emerald" : "bg-muted"}`} />}
                </div>
              ))}
            </div>

            {error && (
              <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-ink mb-2">Daftar</h1>
                  <p className="text-ink-muted mb-6">Buat akun baru</p>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Username</label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-transparent focus:border-accent/30 outline-none transition-colors"
                      placeholder="john_doe"
                      required
                      minLength={3}
                    />
                    {errors.username && <p className="text-xs text-error mt-1">{errors.username}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-transparent focus:border-accent/30 outline-none transition-colors"
                      placeholder="email@example.com"
                      required
                    />
                    {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
                  </div>
                  <Button type="button" onClick={handleNextStep} className="w-full">Lanjut</Button>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-ink mb-2">Daftar</h1>
                  <p className="text-ink-muted mb-6">Lengkapi data akun</p>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full px-4 py-3 pr-10 bg-bg-warm rounded-xl border border-transparent focus:border-accent/30 outline-none transition-colors"
                        placeholder="Min 8 karakter"
                        required
                        minLength={8}
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
                    {form.password.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                        </div>
                        <p className={`text-xs font-medium ${strength.label === "Kuat" ? "text-emerald" : strength.label === "Sedang" ? "text-warning" : "text-error"}`}>
                          Kekuatan password: {strength.label}
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Daftar sebagai</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-transparent focus:border-accent/30 outline-none transition-colors"
                    >
                      <option value="user">Peserta</option>
                      <option value="organizer">Organizer</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">Kembali</Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? (
                        <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Mendaftar...</>
                      ) : "Daftar"}
                    </Button>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald/10 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-ink">Pendaftaran Berhasil!</h2>
                  <p className="text-sm text-ink-muted">Silakan masuk ke akun Anda</p>
                  <Link href="/login">
                    <Button className="w-full">Masuk</Button>
                  </Link>
                </div>
              )}
            </form>

            {step < 3 && (
              <p className="text-center text-sm text-ink-muted mt-6">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-accent underline">
                  Masuk
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
