"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { LoadingPage } from "@/components/shared/Loading";
import ActionMenu from "@/components/ui/ActionMenu";

interface AbsensiSesi { id: number; judul: string; status: string; created_at: string; }
interface AbsensiLog { id: number; username: string; waktu_absen: string; keterangan: string; catatan?: string; }

export default function AbsensiPage() {
  const { id: acaraId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [absensiList, setAbsensiList] = useState<AbsensiSesi[]>([]);
  const [absensiLogs, setAbsensiLogs] = useState<AbsensiLog[]>([]);
  const [acara, setAcara] = useState<{ organizer_id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQr, setShowQr] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState<number | null>(null);
  const [sesiForm, setSesiForm] = useState({ judul: "", lokasi: "" });
  const [showCreate, setShowCreate] = useState(false);
  const [editLog, setEditLog] = useState<AbsensiLog | null>(null);
  const [editKeterangan, setEditKeterangan] = useState("");
  const [editCatatan, setEditCatatan] = useState("");
  const [savingLog, setSavingLog] = useState(false);

  const userId = session?.user?.id;
  const role = session?.user?.role;

  function load() {
    Promise.all([
      fetch(`/api/acara/${acaraId}/absensi`).then((r) => r.json()),
      fetch(`/api/acara/${acaraId}`).then((r) => r.json()),
    ]).then(([absensi, acaraData]) => {
      setAbsensiList(absensi);
      setAcara(acaraData);
    }).catch(() => { toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda"); }).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [acaraId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/acara/${acaraId}/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sesiForm),
      });
      if (res.ok) {
        toast.success("Sesi absensi berhasil dibuat");
        setShowCreate(false);
        setSesiForm({ judul: "", lokasi: "" });
        load();
      } else {
        const data = await res.json();
        toast.error(data.error?.message || "Gagal membuat sesi");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    }
  }

  async function generateQr(absensiId: number) {
    try {
      const res = await fetch(`/api/acara/${acaraId}/absensi/${absensiId}/qr`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setShowQr(data.qrSvg);
      else toast.error("Gagal generate QR");
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    }
  }

  function downloadQr() {
    if (!showQr) return;
    const blob = new Blob([showQr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qr-absensi.svg";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function viewLogs(absensiId: number) {
    setShowLogs(absensiId);
    try {
      const res = await fetch(`/api/acara/${acaraId}/absensi/${absensiId}/logs`);
      const data = await res.json();
      setAbsensiLogs(data);
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    }
  }

  function openEditLog(log: AbsensiLog) {
    setEditLog(log);
    setEditKeterangan(log.keterangan);
    setEditCatatan(log.catatan || "");
  }

  async function handleSaveLog() {
    if (!editLog) return;
    setSavingLog(true);
    try {
      const res = await fetch(`/api/acara/${acaraId}/absensi/${showLogs}/logs/${editLog.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keterangan: editKeterangan, catatan: editCatatan || null }),
      });
      if (res.ok) {
        toast.success("Log berhasil diperbarui");
        setEditLog(null);
        viewLogs(showLogs!);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error?.message || "Gagal memperbarui log");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    } finally {
      setSavingLog(false);
    }
  }

  async function handleDeleteLog(logId: number) {
    if (!confirm("Hapus log absensi ini?")) return;
    try {
      const res = await fetch(`/api/acara/${acaraId}/absensi/${showLogs}/logs/${logId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Log berhasil dihapus");
        viewLogs(showLogs!);
      } else {
        toast.error("Gagal menghapus log");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    }
  }

  if (loading) return <LoadingPage />;

  const isOwner = acara?.organizer_id === userId || role === "admin";

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/dashboard/acara/${acaraId}`)} className="w-10 h-10 rounded-xl bg-card shadow-md flex items-center justify-center text-ink-muted hover:text-ink hover:shadow-lg transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-ink">Sesi Absensi</h1>
        </div>
        {isOwner && (
          <Button size="sm" onClick={() => setShowCreate(true)} className="bg-emerald hover:bg-emerald-hover text-white shadow-md">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Buat Sesi
          </Button>
        )}
      </div>

      {absensiList.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald/10 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <p className="text-sm text-ink-muted font-medium">Belum ada sesi absensi</p>
              <p className="text-xs text-ink-soft mt-1">Organizer dapat membuat sesi absensi baru</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {absensiList.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald/10 shadow-sm flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{s.judul}</p>
                      <p className="text-xs text-ink-muted">
                        {new Date(s.created_at).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      s.status === "dibuka" ? "bg-emerald/15 text-emerald border-emerald/20" :
                      s.status === "ditutup" ? "bg-bg-warm text-ink-muted border-border" :
                      "bg-amber-50 text-amber-600 border-amber-200"
                    }>
                      {s.status === "dibuka" ? "Dibuka" : s.status === "ditutup" ? "Ditutup" : s.status}
                    </Badge>
                    {isOwner && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => generateQr(s.id)} className="border-emerald/30 text-emerald hover:bg-emerald hover:text-white">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => viewLogs(s.id)} className="border-border text-ink-muted hover:bg-bg-warm">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={(v) => !v && setShowCreate(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              Buat Sesi Absensi
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Judul Sesi</label>
              <input value={sesiForm.judul} onChange={(e) => setSesiForm({ ...sesiForm, judul: e.target.value })} className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-transparent focus:border-emerald/30 focus:ring-2 focus:ring-emerald/20 outline-none transition-all" placeholder="Absensi Masuk" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Lokasi (opsional)</label>
              <input value={sesiForm.lokasi} onChange={(e) => setSesiForm({ ...sesiForm, lokasi: e.target.value })} className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-transparent focus:border-emerald/30 focus:ring-2 focus:ring-emerald/20 outline-none transition-all" placeholder="Ruang A" />
            </div>
            <Button type="submit" className="w-full bg-emerald hover:bg-emerald-hover text-white shadow-md">
              <span className="flex items-center gap-2 justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Buat Sesi
              </span>
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showQr} onOpenChange={(v) => !v && setShowQr(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              QR Code Absensi
            </DialogTitle>
          </DialogHeader>
          {showQr && (
            <div className="flex flex-col items-center py-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1 text-xs font-medium text-emerald mb-4">
                <span className="h-2 w-2 rounded-full bg-emerald" />
                Siap dipindai
              </div>
              <div className="bg-card p-4 rounded-xl shadow-md">
                <img
                  src={`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(showQr)}`}
                  alt="QR Code Absensi"
                  className="block w-64 h-64 object-contain"
                />
              </div>
              <p className="text-xs text-ink-muted mt-3 text-center">Scan QR code ini untuk mengisi absensi</p>
              <Button variant="outline" size="sm" onClick={downloadQr} className="mt-4 border-border text-ink-muted hover:bg-bg-warm">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Unduh QR
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!showLogs} onOpenChange={(v) => { if (!v) { setShowLogs(null); setAbsensiLogs([]); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Log Kehadiran
            </DialogTitle>
          </DialogHeader>
          {absensiLogs.length === 0 ? (
            <p className="text-sm text-ink-muted">Belum ada log kehadiran</p>
          ) : (
            <div className="space-y-2">
              {absensiLogs.map((l) => (
                <div key={l.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-ink">{l.username}</span>
                    {l.catatan && <span className="text-ink-soft text-xs ml-2">— {l.catatan}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-ink-muted text-xs">
                      {new Date(l.waktu_absen).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <Badge className={l.keterangan === "hadir" ? "bg-success/15 text-success border-success/20" : l.keterangan === "terlambat" ? "bg-warning/15 text-warning border-warning/20" : l.keterangan === "sakit" ? "bg-info/15 text-info border-info/20" : l.keterangan === "izin" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-destructive/15 text-destructive-foreground"}>{l.keterangan}</Badge>
                    {isOwner && (
                      <ActionMenu
                        actions={[
                          { label: "Edit", icon: "edit", onClick: () => openEditLog(l) },
                          { label: "Hapus", icon: "trash" as const, variant: "danger" as const, onClick: () => handleDeleteLog(l.id) },
                        ]}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editLog} onOpenChange={(v) => !v && setEditLog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              Edit Log Absensi
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-ink-muted">
              <span className="font-medium text-ink">{editLog?.username}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Keterangan</label>
              <select
                value={editKeterangan}
                onChange={(e) => setEditKeterangan(e.target.value)}
                className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-transparent focus:border-emerald/30 focus:ring-2 focus:ring-emerald/20 outline-none transition-all"
              >
                <option value="hadir">Hadir</option>
                <option value="sakit">Sakit</option>
                <option value="izin">Izin</option>
                <option value="terlambat">Terlambat</option>
                <option value="tanpa_keterangan">Tanpa Keterangan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Catatan</label>
              <input
                type="text"
                value={editCatatan}
                onChange={(e) => setEditCatatan(e.target.value)}
                placeholder="Opsional"
                className="w-full px-4 py-3 bg-bg-warm rounded-xl border border-transparent focus:border-emerald/30 focus:ring-2 focus:ring-emerald/20 outline-none transition-all"
              />
            </div>
            <button
              onClick={handleSaveLog}
              disabled={savingLog}
              className="w-full py-3 bg-emerald text-white rounded-xl font-medium shadow-button hover:bg-emerald-hover transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {savingLog ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
