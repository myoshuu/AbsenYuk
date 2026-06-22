"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingPage } from "@/components/shared/Loading";
import { toast } from "sonner";
import AcaraDetailHeader from "@/components/dashboard/acara-detail/AcaraDetailHeader";
import AcaraDetailTabs from "@/components/dashboard/acara-detail/AcaraDetailTabs";

interface AcaraData { id: number; judul: string; deskripsi: string; lokasi: string; tanggal_mulai: string; tanggal_akhir: string; status: string; maks_peserta: number; organizer_id: string; organizer_name: string; }
interface PesertaData { id: string; username: string; }

export default function AcaraDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [acara, setAcara] = useState<AcaraData | null>(null);
  const [peserta, setPeserta] = useState<PesertaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [kickTarget, setKickTarget] = useState<PesertaData | null>(null);
  const [kickLoading, setKickLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ judul: "", deskripsi: "", lokasi: "", tanggal_mulai: "", tanggal_akhir: "", maks_peserta: 0 });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/acara/${id}`).then((r) => r.json()),
      fetch(`/api/acara/${id}/peserta`).then((r) => r.json()),
    ]).then(([a, p]) => { setAcara(a); setPeserta(p); }).catch(() => { toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda"); }).finally(() => setLoading(false));
  }, [id]);

  async function handleJoin() {
    try {
      const res = await fetch(`/api/acara/${id}/peserta`, { method: "POST" });
      if (res.ok) {
        toast.success("Berhasil bergabung");
        const p = await fetch(`/api/acara/${id}/peserta`).then((r) => r.json());
        setPeserta(p);
      } else {
        const data = await res.json();
        toast.error(data.error?.message || "Terjadi kesalahan. Silakan coba lagi");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    }
  }

  async function handleLeave() {
    try {
      const res = await fetch(`/api/acara/${id}/peserta`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Berhasil keluar");
        setPeserta(peserta.filter((p) => p.id !== session?.user?.id));
      } else {
        const data = await res.json();
        toast.error(data.error?.message || "Terjadi kesalahan. Silakan coba lagi");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    }
  }

  async function handleKick() {
    if (!kickTarget) return;
    setKickLoading(true);
    try {
      const res = await fetch(`/api/acara/${id}/peserta`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: kickTarget.id }),
      });
      if (res.ok) {
        setPeserta((prev) => prev.filter((p) => p.id !== kickTarget.id));
        toast.success(`Berhasil mengeluarkan ${kickTarget.username}`);
        setKickTarget(null);
      } else {
        const data = await res.json();
        toast.error(data.error?.message || "Gagal mengeluarkan peserta");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    }
    setKickLoading(false);
  }

  function openEdit() {
    if (!acara) return;
    const toLocal = (d: string | Date) => {
      const date = new Date(d);
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };
    setEditForm({
      judul: acara.judul,
      deskripsi: acara.deskripsi || "",
      lokasi: acara.lokasi || "",
      tanggal_mulai: toLocal(acara.tanggal_mulai),
      tanggal_akhir: toLocal(acara.tanggal_akhir),
      maks_peserta: acara.maks_peserta || 0,
    });
    setEditOpen(true);
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/acara/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        toast.success("Acara berhasil diperbarui");
        setEditOpen(false);
        const a = await fetch(`/api/acara/${id}`).then((r) => r.json());
        setAcara(a);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error?.message || "Gagal memperbarui acara");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    } finally {
      setSavingEdit(false);
    }
  }

  if (loading || !acara) return <LoadingPage />;
  const userId = session?.user?.id;
  const role = session?.user?.role;
  const joined = peserta.some((p) => p.id === userId);
  const isOwner = acara.organizer_id === userId || role === "admin";

  return (
    <div className="animate-fade-in space-y-6">
      <AcaraDetailHeader
        acara={acara}
        isJoined={joined}
        isOwner={isOwner}
        role={role}
        onJoin={handleJoin}
        onLeave={handleLeave}
      />

      <AcaraDetailTabs isOwner={isOwner} />

      <div className="max-w-3xl">
        <div className="space-y-5">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="font-semibold text-ink text-lg flex-1">Detail Acara</h2>
                {isOwner && (
                  <button onClick={openEdit} className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-bg-warm transition-colors" title="Edit acara">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="bg-bg-warm/50 rounded-xl p-4">
                  <p className="text-xs text-ink-muted mb-1">Lokasi</p>
                  <p className="text-ink font-medium flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {acara.lokasi || "Tidak ditentukan"}
                  </p>
                </div>
                <div className="bg-bg-warm/50 rounded-xl p-4">
                  <p className="text-xs text-ink-muted mb-1">Tanggal Mulai</p>
                  <p className="text-ink font-medium flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(acara.tanggal_mulai).toLocaleDateString("id-ID", { dateStyle: "full" })}
                  </p>
                </div>
                <div className="bg-bg-warm/50 rounded-xl p-4">
                  <p className="text-xs text-ink-muted mb-1">Tanggal Selesai</p>
                  <p className="text-ink font-medium flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(acara.tanggal_akhir).toLocaleDateString("id-ID", { dateStyle: "full" })}
                  </p>
                </div>
                <div className="bg-bg-warm/50 rounded-xl p-4">
                  <p className="text-xs text-ink-muted mb-1">Kapasitas</p>
                  <p className="text-ink font-medium flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {acara.maks_peserta ? `${acara.maks_peserta} orang` : "Tidak terbatas"}
                  </p>
                </div>
              </div>
              {acara.deskripsi && (
                <div className="mt-5 pt-5 border-t border-border">
                  <p className="text-xs text-ink-muted mb-2">Deskripsi</p>
                  <p className="text-ink leading-relaxed">{acara.deskripsi}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h2 className="font-semibold text-ink text-lg">Daftar Peserta</h2>
                  <Badge className="bg-emerald/10 text-emerald border-emerald/20">{peserta.length}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                {peserta.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-warm/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald to-emerald/60 flex items-center justify-center text-sm font-bold text-white shadow-md">
                      {p.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-ink font-medium flex-1">{p.username}</span>
                    {isOwner && p.id !== userId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setKickTarget(p)}
                        className="text-error hover:text-error hover:bg-error/10"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a4 4 0 00-4 4v2h8v-2a4 4 0 00-4-4z" />
                        </svg>
                      </Button>
                    )}
                  </div>
                ))}
                {peserta.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-emerald/10 mx-auto mb-3 flex items-center justify-center">
                      <svg className="w-8 h-8 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-ink-muted">Belum ada peserta yang bergabung</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={(v) => !v && setEditOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              Edit Acara
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Judul</label>
              <input
                value={editForm.judul}
                onChange={(e) => setEditForm({ ...editForm, judul: e.target.value })}
                className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-transparent focus:border-emerald/30 focus:ring-2 focus:ring-emerald/20 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Deskripsi</label>
              <textarea
                value={editForm.deskripsi}
                onChange={(e) => setEditForm({ ...editForm, deskripsi: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-transparent focus:border-emerald/30 focus:ring-2 focus:ring-emerald/20 outline-none transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Lokasi</label>
              <input
                value={editForm.lokasi}
                onChange={(e) => setEditForm({ ...editForm, lokasi: e.target.value })}
                className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-transparent focus:border-emerald/30 focus:ring-2 focus:ring-emerald/20 outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Tanggal Mulai</label>
                <input
                  type="datetime-local"
                  value={editForm.tanggal_mulai}
                  onChange={(e) => setEditForm({ ...editForm, tanggal_mulai: e.target.value })}
                  className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-transparent focus:border-emerald/30 focus:ring-2 focus:ring-emerald/20 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Tanggal Selesai</label>
                <input
                  type="datetime-local"
                  value={editForm.tanggal_akhir}
                  onChange={(e) => setEditForm({ ...editForm, tanggal_akhir: e.target.value })}
                  className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-transparent focus:border-emerald/30 focus:ring-2 focus:ring-emerald/20 outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Maks Peserta (0 = tidak terbatas)</label>
              <input
                type="number"
                value={editForm.maks_peserta}
                onChange={(e) => setEditForm({ ...editForm, maks_peserta: Number(e.target.value) })}
                min={0}
                className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-transparent focus:border-emerald/30 focus:ring-2 focus:ring-emerald/20 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={savingEdit}
              className="w-full py-3 bg-emerald text-white rounded-xl font-medium shadow-button hover:bg-emerald-hover transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!kickTarget} onOpenChange={(v) => !v && setKickTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              Keluarkan Peserta
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-ink-muted mb-4">
              Yakin ingin mengeluarkan <strong className="text-ink">{kickTarget?.username}</strong> dari acara ini?
            </p>
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <p className="text-sm text-red-600">Peserta tidak akan bisa mengakses acara lagi.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setKickTarget(null)} className="flex-1">Batal</Button>
            <Button variant="destructive" onClick={handleKick} disabled={kickLoading} className="flex-1">
              {kickLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Mengeluarkan...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a4 4 0 00-4 4v2h8v-2a4 4 0 00-4-4z" />
                  </svg>
                  Keluarkan
                </span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
