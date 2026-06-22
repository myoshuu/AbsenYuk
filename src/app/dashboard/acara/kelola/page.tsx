"use client";

import { useEffect, useState } from "react";
import { cacheGet, cacheSet } from "@/lib/cache";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { LoadingPage } from "@/components/shared/Loading";
import EmptyState from "@/components/shared/EmptyState";
import { useSession } from "next-auth/react";
import OrganizerStats from "@/components/dashboard/OrganizerStats";
import PerformanceBar from "@/components/ui/PerformanceBar";

const statusConfig: Record<string, { label: string; color: string; dot: string; bg: string }> = {
  akan_datang: { label: "Akan Datang", color: "text-emerald", dot: "bg-emerald", bg: "bg-emerald/10 border-emerald/20" },
  berlangsung: { label: "Berlangsung", color: "text-emerald", dot: "bg-emerald", bg: "bg-emerald/10 border-emerald/20" },
  selesai: { label: "Selesai", color: "text-ink-muted", dot: "bg-ink-muted", bg: "bg-bg-warm border-border" },
  dibatalkan: { label: "Dibatalkan", color: "text-error", dot: "bg-error", bg: "bg-error/10 border-error/20" },
};

export default function KelolaAcaraPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [acara, setAcara] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ judul: "", deskripsi: "", lokasi: "", tanggal_mulai: "", tanggal_akhir: "", maks_peserta: 0 });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const role = (session?.user as any)?.role;
  const [quickEventId, setQuickEventId] = useState("");

  async function load() {
    setLoading(true);
    const key = "acara:kelola";
    const cached = await cacheGet<any[]>(key);
    if (cached) { setAcara(cached); setLoading(false); return; }
    try {
      const res = await fetch("/api/acara");
      const data = await res.json();
      setAcara(data);
      cacheSet(key, data, 60);
    } catch { toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda"); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/acara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Acara berhasil dibuat");
        setShowModal(false);
        setForm({ judul: "", deskripsi: "", lokasi: "", tanggal_mulai: "", tanggal_akhir: "", maks_peserta: 0 });
        load();
      } else {
        const data = await res.json();
        toast.error(data.error?.message || "Gagal membuat acara");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/acara/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Acara berhasil dihapus");
        setDeleteTarget(null);
        load();
      } else {
        const data = await res.json();
        toast.error(data.error?.message || "Gagal menghapus");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    }
    setDeleting(false);
  }

  if (loading) return <LoadingPage />;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Kelola Acara</h1>
          <p className="text-sm text-ink-muted mt-1">Atur dan kelola semua acara Anda</p>
        </div>
        {(role === "organizer" || role === "admin") && (
          <Button onClick={() => setShowModal(true)} className="bg-emerald hover:bg-emerald-hover text-white shadow-md">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Buat Acara
            </span>
          </Button>
        )}
      </div>

      <OrganizerStats />

      {/* Quick Attendance Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-ink">Quick Attendance</h2>
              <p className="text-xs text-ink-muted">Mulai sesi absensi dengan cepat</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <select
                value={quickEventId}
                onChange={(e) => setQuickEventId(e.target.value)}
                className="w-full px-4 py-3 pr-10 bg-bg-warm rounded-xl border border-border focus:border-emerald/30 focus:ring-2 focus:ring-emerald/20 outline-none text-sm appearance-none cursor-pointer"
              >
                <option value="">Pilih acara...</option>
                {acara.filter((a) => a.status === "akan_datang" || a.status === "berlangsung").map((a) => (
                  <option key={a.id} value={a.id}>{a.judul}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <Button size="sm" disabled={!quickEventId} onClick={() => router.push(`/dashboard/acara/${quickEventId}?tab=absensi`)} className="shrink-0 bg-emerald hover:bg-emerald-hover text-white shadow-md">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
                Mulai
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Acara List */}
      {acara.length === 0 ? (
        <EmptyState
          title="Belum ada acara"
          description="Buat acara pertama Anda untuk mulai mengelola kehadiran peserta"
          action={{ label: "Buat Acara", onClick: () => setShowModal(true) }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {acara.map((a) => (
            <Card key={a.id} className="hover:shadow-xl transition-all duration-200">
              <CardContent className="p-5">
                {/* Status & Title */}
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`${statusConfig[a.status]?.bg || ""} ${statusConfig[a.status]?.color || ""}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig[a.status]?.dot || ""}`} />
                    {statusConfig[a.status]?.label || a.status}
                  </Badge>
                </div>

                <h3 className="font-semibold text-ink text-base mb-2 line-clamp-2">{a.judul}</h3>

                {/* Meta Info */}
                <div className="space-y-2 text-sm text-ink-muted mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="truncate">{a.lokasi || "Lokasi tidak ditentukan"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(a.tanggal_mulai).toLocaleDateString("id-ID", { dateStyle: "medium" })}</span>
                  </div>
                </div>

                {/* Participation Progress */}
                {a.maks_peserta > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-ink-muted mb-1.5">
                      <span>Partisipasi</span>
                      <span className="font-medium text-ink">{(a.peserta_count ?? 0)} / {a.maks_peserta}</span>
                    </div>
                    <div className="h-2 bg-bg-warm rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald to-emerald/70 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(Math.round(((a.peserta_count ?? 0) / a.maks_peserta) * 100), 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-border">
                  <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/acara/${a.id}`)} className="flex-1 border-emerald/30 text-emerald hover:bg-emerald hover:text-white transition-all">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Detail
                    </span>
                  </Button>
                  {a.status === "berlangsung" && (
                    <Button size="sm" onClick={() => router.push(`/dashboard/acara/${a.id}?tab=absensi`)} className="flex-1 bg-emerald hover:bg-emerald-hover text-white shadow-md">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Absensi
                      </span>
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(a)} className="text-error hover:text-error hover:bg-error/10">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Performa Section */}
      <div className="pt-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">Performa Acara</h2>
            <p className="text-xs text-ink-muted">Tingkat partisipasi acara Anda</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-5">
            <div className="space-y-3">
              {[...acara]
                .sort((a, b) => {
                  const pctA = a.maks_peserta > 0 ? (a.peserta_count ?? 0) / a.maks_peserta : 0;
                  const pctB = b.maks_peserta > 0 ? (b.peserta_count ?? 0) / b.maks_peserta : 0;
                  return pctB - pctA;
                })
                .slice(0, 5)
                .map((a) => {
                  const colorMap: Record<string, string> = { berlangsung: "bg-emerald", selesai: "bg-ink-muted", dibatalkan: "bg-error" };
                  return (
                    <PerformanceBar
                      key={a.id}
                      label={a.judul}
                      value={a.peserta_count ?? 0}
                      max={a.maks_peserta || 1}
                      color={colorMap[a.status] || "bg-emerald"}
                    />
                  );
                })}
              {acara.length === 0 && (
                <p className="text-sm text-ink-soft text-center py-4">Belum ada data acara</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Dialog open={showModal} onOpenChange={(v) => !v && setShowModal(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              Buat Acara Baru
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Judul Acara</label>
              <input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-border focus:border-emerald/30 focus:ring-2 focus:ring-emerald/20 outline-none transition-all" placeholder="Masukkan judul acara" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Deskripsi</label>
              <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-border focus:border-emerald/30 focus:ring-2 focus:ring-emerald/20 outline-none resize-none h-24 transition-all" placeholder="Jelaskan tentang acara Anda" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Lokasi</label>
              <input value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-border focus:border-emerald/30 focus:ring-2 focus:ring-emerald/20 outline-none transition-all" placeholder="Tempat acara" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Mulai</label>
                <input type="datetime-local" value={form.tanggal_mulai} onChange={(e) => setForm({ ...form, tanggal_mulai: e.target.value })} className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-border focus:border-emerald/30 focus:ring-2 focus:ring-emerald/20 outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Selesai</label>
                <input type="datetime-local" value={form.tanggal_akhir} onChange={(e) => setForm({ ...form, tanggal_akhir: e.target.value })} className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-border focus:border-emerald/30 focus:ring-2 focus:ring-emerald/20 outline-none transition-all" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Kapasitas Peserta</label>
              <input type="number" value={form.maks_peserta} onChange={(e) => setForm({ ...form, maks_peserta: Number(e.target.value) })} className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-border focus:border-emerald/30 focus:ring-2 focus:ring-emerald/20 outline-none transition-all" placeholder="0 = tidak terbatas" />
            </div>
            <Button type="submit" disabled={saving} className="w-full bg-emerald hover:bg-emerald-hover text-white shadow-md">
              {saving ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Menyimpan...
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Buat Acara
                </span>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-error">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              Hapus Acara?
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-ink-muted mb-4">
              Yakin ingin menghapus <strong className="text-ink">{deleteTarget?.judul}</strong>?
            </p>
            <div className="p-4 bg-error/5 rounded-xl border border-error/20">
              <p className="text-sm text-error">Semua data peserta, absensi, dan chat akan dihapus permanen.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1">Batal</Button>
            <Button onClick={handleDelete} disabled={deleting} className="flex-1 bg-error hover:bg-error/90 text-white">
              {deleting ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Menghapus...
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Hapus
                </span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
