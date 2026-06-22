"use client";

import { useEffect, useState, useMemo } from "react";
import { cacheGet, cacheSet, cacheInvalidate } from "@/lib/cache";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import ActionMenu from "@/components/ui/ActionMenu";
import Pagination from "@/components/ui/Pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingPage } from "@/components/shared/Loading";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";
import SearchInput from "@/components/ui/SearchInput";

interface AbsensiLogItem { id: number; acara_judul: string; username: string; keterangan: string; catatan?: string; waktu_absen: string; }

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminAbsensiPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AbsensiLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keteranganFilter, setKeteranganFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [page, setPage] = useState(1);
  const [editModal, setEditModal] = useState<AbsensiLogItem | null>(null);
  const [editKeterangan, setEditKeterangan] = useState("");
  const [editCatatan, setEditCatatan] = useState("");
  const [saving, setSaving] = useState(false);
  const perPage = 10;

  useEffect(() => {
    let cancelled = false;
    load(cancelled);
    return () => { cancelled = true; };
  }, []);

  async function load(cancelled?: boolean) {
    const key = "admin:absensi:list";
    await cacheInvalidate(key);
    const cached = await cacheGet<AbsensiLogItem[]>(key);
    if (cached) { if (!cancelled) { setLogs(cached); setLoading(false); } return; }
    try {
      const res = await fetch("/api/admin/absensi");
      if (!res.ok) {
        if (!cancelled) { toast.error("Terjadi kesalahan. Silakan coba lagi"); setLogs([]); setLoading(false); }
        return;
      }
      const data = await res.json();
      if (!cancelled) {
        if (data.error) { toast.error(data.error.message); setLogs([]); }
        else { setLogs(data); cacheSet(key, data, 60); }
        setLoading(false);
      }
    } catch { if (!cancelled) { toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda"); setLoading(false); } }
  }

  function openEdit(log: AbsensiLogItem) {
    setEditModal(log);
    setEditKeterangan(log.keterangan);
    setEditCatatan(log.catatan || "");
  }

  async function handleSave() {
    if (!editModal) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/absensi/${editModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keterangan: editKeterangan, catatan: editCatatan || null }),
      });
      if (res.ok) {
        toast.success("Log berhasil diperbarui");
        setEditModal(null);
        await cacheInvalidate("admin:absensi:list");
        await load();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error?.message || "Gagal memperbarui log");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus log absensi ini?")) return;
    try {
      const res = await fetch(`/api/admin/absensi/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Log berhasil dihapus");
        await cacheInvalidate("admin:absensi:list");
        await load();
      } else {
        toast.error("Gagal menghapus log");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    }
  }

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (keteranganFilter && l.keterangan !== keteranganFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!l.username.toLowerCase().includes(q) && !l.acara_judul.toLowerCase().includes(q)) return false;
      }
      if (dateStart && l.waktu_absen < dateStart) return false;
      if (dateEnd) {
        const endDate = new Date(dateEnd);
        endDate.setDate(endDate.getDate() + 1);
        if (l.waktu_absen >= endDate.toISOString().slice(0, 10)) return false;
      }
      return true;
    });
  }, [logs, keteranganFilter, searchQuery, dateStart, dateEnd]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / perPage));
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredLogs.slice(start, start + perPage);
  }, [filteredLogs, page]);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const columns = [
    {
      key: "acara_judul",
      label: "Acara",
      sortable: true,
    },
    {
      key: "username",
      label: "Peserta",
      sortable: true,
    },
    {
      key: "keterangan",
      label: "Keterangan",
      sortable: true,
      render: (value: string) => (
        <Badge className={value === "hadir" ? "bg-success/15 text-success border-success/20" : value === "terlambat" ? "bg-warning/15 text-warning border-warning/20" : "bg-destructive/15 text-destructive-foreground"}>{value}</Badge>
      ),
    },
    {
      key: "waktu_absen",
      label: "Waktu",
      render: (value: string) => (
        <span className="text-ink-muted text-xs">{formatRelativeTime(value)}</span>
      ),
    },
    {
      key: "aksi",
      label: "Aksi",
      width: "80px",
      render: (_: unknown, row: AbsensiLogItem) => (
        <div className="flex justify-end">
          <ActionMenu
            actions={[
              { label: "Edit", icon: "edit", onClick: () => openEdit(row) },
              { label: "Hapus", icon: "trash" as const, variant: "danger" as const, onClick: () => handleDelete(row.id) },
            ]}
          />
        </div>
      ),
    },
  ];

  if (loading) return <LoadingPage />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push("/dashboard/admin")} className="text-ink-muted hover:text-ink transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-ink">Absensi Manager</h1>
          <p className="text-ink-muted text-sm">Total {logs.length} log kehadiran</p>
        </div>
        <SearchInput
          placeholder="Cari username atau acara..."
          onSearch={(v) => { setSearchQuery(v); setPage(1); }}
          className="w-64"
        />
      </div>

      {logs.length === 0 ? (
        <EmptyState title="Belum ada absensi" description="Belum ada kehadiran yang tercatat" />
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <select value={keteranganFilter} onChange={(e) => { setKeteranganFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-sm bg-bg-warm rounded-xl border border-border outline-none">
                <option value="">Semua Status</option>
                <option value="hadir">Hadir</option>
                <option value="terlambat">Terlambat</option>
                <option value="tidak_hadir">Tidak Hadir</option>
              </select>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => { setDateStart(e.target.value); setPage(1); }}
                className="px-3 py-2 text-sm bg-bg-warm rounded-xl border border-border outline-none text-ink"
                placeholder="Dari tanggal"
              />
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => { setDateEnd(e.target.value); setPage(1); }}
                className="px-3 py-2 text-sm bg-bg-warm rounded-xl border border-border outline-none text-ink"
                placeholder="Sampai tanggal"
              />
            </div>
            {paginatedLogs.length === 0 ? (
              <p className="text-sm text-ink-muted text-center py-8">Tidak ada data absensi</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead key={col.key} style={{ width: col.width }}>{col.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.map((row, i) => (
                    <TableRow key={i}>
                      {columns.map((col) => (
                        <TableCell key={col.key}>{col.render ? (col.render as any)((row as any)[col.key], row) : (row as any)[col.key]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="mt-4">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} pageSize={perPage} totalItems={filteredLogs.length} />
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!editModal} onOpenChange={(v) => !v && setEditModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Log Absensi</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-ink-muted">
              <span className="font-medium text-ink">{editModal?.username}</span> — {editModal?.acara_judul}
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Keterangan</label>
              <select
                value={editKeterangan}
                onChange={(e) => setEditKeterangan(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-bg-warm text-ink text-sm outline-none focus:ring-2 focus:ring-emerald/40"
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
                className="w-full px-3 py-2 rounded-xl border border-border bg-bg-warm text-ink text-sm outline-none focus:ring-2 focus:ring-emerald/40"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-emerald text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
