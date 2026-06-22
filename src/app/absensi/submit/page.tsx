"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession, SessionProvider } from "next-auth/react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

function AbsensiSubmitForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const token = searchParams.get("token");

  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [keterangan, setKeterangan] = useState("");
  const [catatan, setCatatan] = useState("");

  const statusOptions = [
    { key: "hadir", label: "Hadir", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-emerald", activeBg: "bg-emerald/5", activeBorder: "border-emerald" },
    { key: "izin", label: "Izin", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z", color: "text-warning", activeBg: "bg-warning/5", activeBorder: "border-warning" },
    { key: "sakit", label: "Sakit", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", color: "text-error", activeBg: "bg-error/5", activeBorder: "border-error" },
    { key: "tanpa_keterangan", label: "Alpha", icon: "M6 18L18 6M6 6l12 12", color: "text-error", activeBg: "bg-error/5", activeBorder: "border-error" },
  ];

  useEffect(() => {
    if (!token) { setError("Token tidak valid"); setLoading(false); return; }
    fetch(`/api/absensi/token/${token}`).then((r) => r.json()).then((d) => {
      if (d.error) { setError(d.error.message); } else { setDetail(d); }
    }).catch(() => setError("Gagal memuat data")).finally(() => setLoading(false));
  }, [token]);

  async function handleSubmitForm() {
    if (!keterangan || submitting) return;
    setSubmitting(true);
    const res = await fetch("/api/absensi/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, keterangan, catatan: catatan || undefined }),
    });
    setSubmitting(false);
    if (res.ok) {
      setSuccessAnimation(true);
      setTimeout(() => {
        setDone(true);
        toast.success("Absensi berhasil!");
      }, 800);
    } else {
      const data = await res.json();
      toast.error(data.error?.message || "Gagal mengirim kehadiran");
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="bg-bg-card rounded-2xl p-8 shadow-card border border-border text-center animate-fade-in">
        <div className="w-10 h-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-ink-muted">Memuat data absensi...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-bg-card rounded-2xl p-8 shadow-card border border-border max-w-md text-center animate-fade-in">
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-ink mb-2">Gagal</h2>
        <p className="text-ink-muted mb-6">{error}</p>
        <Button onClick={() => router.push("/")}>Kembali ke Beranda</Button>
      </div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-bg-card rounded-2xl p-8 shadow-card border border-border max-w-md text-center animate-scale-in">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-ink mb-2">Absensi Berhasil!</h2>
        <p className="text-ink-muted mb-6">Kehadiran Anda telah dicatat</p>
        <Button onClick={() => router.push(session ? "/dashboard" : "/")}>Selesai</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border max-w-md w-full">
        {!session && (
          <div className="bg-info/10 text-info text-xs font-medium px-4 py-3 rounded-xl mb-4 text-center">
            Anda belum login.{" "}
            <button
              onClick={() => signIn(undefined, { callbackUrl: window.location.href })}
              className="underline font-semibold"
            >
              Masuk
            </button>{" "}
            agar kehadiran terhubung ke akun Anda.
          </div>
        )}

        {/* Event Context Card */}
        <div className="bg-bg-card rounded-xl p-5 border border-border mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">Detail Acara</span>
          </div>
          <h1 className="text-lg font-bold text-ink">{detail?.acara_judul}</h1>
          <p className="text-sm text-ink-muted mt-0.5">{detail?.absensi_judul}</p>
          {detail?.lokasi && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-ink-soft">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {detail.lokasi}
            </div>
          )}
        </div>

        {session && (
          <div className="flex items-center gap-3 bg-bg-card rounded-xl p-4 border border-border mb-6 animate-slide-up">
            <div className="w-10 h-10 bg-emerald/10 rounded-full flex items-center justify-center text-sm font-bold text-emerald shrink-0">
              {session.user?.image ? (
                <img src={session.user.image} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                session.user?.name?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink">{session.user?.name}</p>
              <p className="text-xs text-ink-muted">{session.user?.email} &middot; {(session.user as any)?.role || "Peserta"}</p>
            </div>
            <svg className="w-5 h-5 text-emerald shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        <div className="border-t border-border my-6" />

        {/* Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {statusOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => !submitting && setKeterangan(opt.key)}
              className={`relative rounded-xl border-2 p-4 text-center transition-all card-hover-enhanced ${
                keterangan === opt.key
                  ? `${opt.activeBorder} ${opt.activeBg}`
                  : "border-border hover:border-black/20 hover:-translate-y-0.5"
              }`}
            >
              {keterangan === opt.key && (
                <svg className="absolute top-1.5 right-1.5 w-4 h-4 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
              <svg className={`w-7 h-7 mx-auto mb-1.5 ${keterangan === opt.key ? opt.color : "text-ink-muted"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={opt.icon} />
              </svg>
              <p className={`text-sm font-medium ${keterangan === opt.key ? "text-ink" : "text-ink-muted"}`}>{opt.label}</p>
            </button>
          ))}
        </div>

        {/* Note */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-ink mb-1.5 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-ink-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Catatan (Opsional)
          </label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Tambahkan catatan jika diperlukan..."
            maxLength={500}
            rows={4}
            className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-transparent focus:border-accent/30 outline-none transition-colors resize-none text-sm"
          />
          <p className={`text-xs text-right mt-1 tabular-nums ${catatan.length >= 450 ? "text-warning" : "text-ink-soft"}`}>{catatan.length}/500</p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmitForm}
          disabled={!keterangan || submitting}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2
            ${successAnimation
              ? "bg-success text-white"
              : keterangan
                ? "bg-emerald text-white shadow-button hover:bg-emerald-hover hover:shadow-md active:scale-[0.96]"
                : "bg-muted text-ink-muted cursor-not-allowed"
            }`}
        >
          {successAnimation ? (
            <>
              <svg className="w-5 h-5 animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Berhasil!
            </>
          ) : submitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Mengirim...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Kirim Kehadiran
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}

export default function AbsensiSubmitPage() {
  return (
    <SessionProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      }>
        <AbsensiSubmitForm />
      </Suspense>
    </SessionProvider>
  );
}
