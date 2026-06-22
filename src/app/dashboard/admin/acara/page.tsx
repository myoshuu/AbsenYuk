"use client";

import { useEffect, useState } from "react";
import { cacheGet, cacheSet, cacheInvalidate } from "@/lib/cache";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { LoadingPage } from "@/components/shared/Loading";
import { toast } from "sonner";
import EmptyState from "@/components/shared/EmptyState";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import ActionMenu from "@/components/ui/ActionMenu";
import Pagination from "@/components/ui/Pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SearchInput from "@/components/ui/SearchInput";
import FilterChips from "@/components/ui/FilterChips";

interface AcaraAdminItem { id: number; judul: string; deskripsi: string; lokasi: string; tanggal_mulai: string; tanggal_akhir: string; status: string; maks_peserta: number; organizer_name: string | null; }

const statusLabel: Record<string, string> = { akan_datang: "Akan Datang", berlangsung: "Berlangsung", selesai: "Selesai", dibatalkan: "Dibatalkan" };
const statusBadgeClass: Record<string, string> = { akan_datang: "bg-info/15 text-info border-info/20", berlangsung: "bg-success/15 text-success border-success/20", selesai: "border-border text-ink-muted", dibatalkan: "bg-destructive/15 text-destructive-foreground" };

export default function AdminAcaraPage() {
  const router = useRouter();
  const [acara, setAcara] = useState<AcaraAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const pageSize = 10;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ judul: "", deskripsi: "", lokasi: "", tanggal_mulai: "", tanggal_akhir: "", status: "akan_datang", maks_peserta: 0 });
  const [createSaving, setCreateSaving] = useState(false);

  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    lokasi: "",
    tanggal_mulai: "",
    tanggal_akhir: "",
    status: "akan_datang",
    maks_peserta: 0,
  });

  async function load() {
    const key = "admin:acara:list";
    const cached = await cacheGet<AcaraAdminItem[]>(key);
    if (cached) { setAcara(cached); setPage(1); setLoading(false); return; }
    try {
      const res = await fetch("/api/acara");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error?.message || "Terjadi kesalahan. Silakan coba lagi");
        return;
      }
      const data = await res.json();
      setAcara(data);
      setPage(1);
      cacheSet(key, data, 60);
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: number) {
    if (!confirm("Hapus acara ini?")) return;
    try {
      const res = await fetch(`/api/acara/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Acara berhasil dihapus"); await cacheInvalidate("admin:acara:list"); load(); }
      else toast.error("Gagal menghapus");
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    }
  }

  function openEdit(a: AcaraAdminItem) {
    setEditId(a.id);
    setForm({
      judul: a.judul || "",
      deskripsi: a.deskripsi || "",
      lokasi: a.lokasi || "",
      tanggal_mulai: a.tanggal_mulai ? a.tanggal_mulai.slice(0, 16) : "",
      tanggal_akhir: a.tanggal_akhir ? a.tanggal_akhir.slice(0, 16) : "",
      status: a.status || "akan_datang",
      maks_peserta: a.maks_peserta || 0,
    });
    setEditOpen(true);
  }

  async function handleSave() {
    if (!form.judul.trim()) { toast.error("Judul wajib diisi"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/acara/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, maks_peserta: Number(form.maks_peserta) }),
      });
      if (res.ok) {
        toast.success("Acara berhasil diupdate");
        setEditOpen(false);
        await cacheInvalidate("admin:acara:list"); load();
      } else {
        toast.error("Gagal mengupdate acara");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    } finally {
      setSaving(false);
    }
  }

  const filtered = acara.filter((a) => {
    const matchSearch = !searchQuery || a.judul.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    {
      key: "select",
      label: "",
      width: "40px",
      render: (_: unknown, row: AcaraAdminItem) => (
        <input type="checkbox" className="w-4 h-4 rounded border-border text-accent focus:ring-accent/30" />
      ),
    },
    { key: "judul", label: "Judul", sortable: true },
    { key: "organizer_name", label: "Organizer", sortable: true, render: (v: string) => v || "-" },
    {
      key: "peserta",
      label: "Peserta",
      render: (_: unknown, row: AcaraAdminItem) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-ink/5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald rounded-full" style={{ width: `${Math.min(100, (row.maks_peserta > 0 ? 50 : 0))}%` }} />
          </div>
          <span className="text-xs text-ink-muted whitespace-nowrap">-/{row.maks_peserta}</span>
        </div>
      ),
    },
    { key: "status", label: "Status", render: (v: string) => <Badge className={statusBadgeClass[v] || ""}>{statusLabel[v]}</Badge> },
    {
      key: "aksi", label: "Aksi",
      render: (_: unknown, row: AcaraAdminItem) => (
        <div className="flex justify-end">
          <ActionMenu
            actions={[
              { label: "Edit", icon: "edit", onClick: () => openEdit(row) },
              { label: "Detail", icon: "eye", onClick: () => router.push(`/dashboard/acara/${row.id}`) },
              { label: "Hapus", icon: "trash", variant: "danger", onClick: () => handleDelete(row.id) },
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
          <h1 className="text-2xl font-bold text-ink">Acara Manager</h1>
          <p className="text-ink-muted text-sm">Total {acara.length} acara</p>
        </div>
        <SearchInput
          placeholder="Cari judul acara..."
          onSearch={(v) => { setSearchQuery(v); setPage(1); }}
          className="w-64"
        />
        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald text-white text-sm font-medium hover:opacity-90 transition-all active:scale-[0.96]"
        >
          Tambah Acara
        </button>
      </div>

      <FilterChips
        options={[
          { value: "", label: "Semua" },
          { value: "akan_datang", label: "Akan Datang" },
          { value: "berlangsung", label: "Berlangsung" },
          { value: "selesai", label: "Selesai" },
          { value: "dibatalkan", label: "Dibatalkan" },
        ]}
        value={statusFilter}
        onChange={(v) => { setStatusFilter(v); setPage(1); }}
      />

      {acara.length === 0 ? (
        <EmptyState title="Belum ada acara" description="Belum ada acara yang dibuat di platform" />
      ) : (
        <Card>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key} style={{ width: col.width }}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((row, i) => (
                  <TableRow key={row.id || i}>
                    {columns.map((col) => (
                      <TableCell key={col.key}>{col.render ? col.render((row as any)[col.key], row) : (row as any)[col.key]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={acara.length} />
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={editOpen} onOpenChange={(v) => !v && setEditOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Acara</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Judul</label>
              <input type="text" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-bg-warm text-ink text-sm outline-none focus:ring-2 focus:ring-emerald/40" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Deskripsi</label>
              <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-bg-warm text-ink text-sm outline-none focus:ring-2 focus:ring-emerald/40" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Lokasi</label>
              <input type="text" value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-bg-warm text-ink text-sm outline-none focus:ring-2 focus:ring-emerald/40" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Tanggal Mulai</label>
              <input type="datetime-local" value={form.tanggal_mulai} onChange={(e) => setForm({ ...form, tanggal_mulai: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-bg-warm text-ink text-sm outline-none focus:ring-2 focus:ring-emerald/40" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Tanggal Akhir</label>
              <input type="datetime-local" value={form.tanggal_akhir} onChange={(e) => setForm({ ...form, tanggal_akhir: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-bg-warm text-ink text-sm outline-none focus:ring-2 focus:ring-emerald/40" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-bg-warm text-ink text-sm outline-none focus:ring-2 focus:ring-emerald/40">
                <option value="akan_datang">Akan Datang</option>
                <option value="berlangsung">Berlangsung</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Maks Peserta</label>
              <input type="number" value={form.maks_peserta} onChange={(e) => setForm({ ...form, maks_peserta: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-border bg-bg-warm text-ink text-sm outline-none focus:ring-2 focus:ring-emerald/40" min={0} />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-emerald text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {saving ? (
                <span className="inline-flex items-center gap-2 justify-center"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Menyimpan...</span>
              ) : "Simpan"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={(v) => !v && setCreateOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Acara</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Judul</label>
            <input type="text" value={createForm.judul} onChange={(e) => setCreateForm({ ...createForm, judul: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-bg-warm text-ink text-sm outline-none focus:ring-2 focus:ring-emerald/40" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Deskripsi</label>
            <textarea value={createForm.deskripsi} onChange={(e) => setCreateForm({ ...createForm, deskripsi: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-bg-warm text-ink text-sm outline-none focus:ring-2 focus:ring-emerald/40" rows={3} maxLength={500} />
            <div className="text-xs text-ink-muted text-right mt-1">{(createForm.deskripsi || "").length}/500</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Lokasi</label>
            <input type="text" value={createForm.lokasi} onChange={(e) => setCreateForm({ ...createForm, lokasi: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-bg-warm text-ink text-sm outline-none focus:ring-2 focus:ring-emerald/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Tanggal Mulai</label>
            <input type="datetime-local" value={createForm.tanggal_mulai} onChange={(e) => setCreateForm({ ...createForm, tanggal_mulai: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-bg-warm text-ink text-sm outline-none focus:ring-2 focus:ring-emerald/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Tanggal Akhir</label>
            <input type="datetime-local" value={createForm.tanggal_akhir} onChange={(e) => setCreateForm({ ...createForm, tanggal_akhir: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-bg-warm text-ink text-sm outline-none focus:ring-2 focus:ring-emerald/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Status</label>
            <select value={createForm.status} onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border bg-bg-warm text-ink text-sm outline-none focus:ring-2 focus:ring-emerald/40">
              <option value="akan_datang">Akan Datang</option>
              <option value="berlangsung">Berlangsung</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Maks Peserta</label>
            <input type="number" value={createForm.maks_peserta} onChange={(e) => setCreateForm({ ...createForm, maks_peserta: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-border bg-bg-warm text-ink text-sm outline-none focus:ring-2 focus:ring-emerald/40" min={0} />
          </div>
          <button
            onClick={async () => {
              if (!createForm.judul.trim()) { toast.error("Judul wajib diisi"); return; }
              setCreateSaving(true);
              try {
                const res = await fetch("/api/acara", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...createForm, maks_peserta: Number(createForm.maks_peserta) }),
                });
                if (res.ok) {
                  toast.success("Acara berhasil dibuat");
                  setCreateOpen(false);
                  setCreateForm({ judul: "", deskripsi: "", lokasi: "", tanggal_mulai: "", tanggal_akhir: "", status: "akan_datang", maks_peserta: 0 });
                  await cacheInvalidate("admin:acara:list"); load();
                } else {
                  toast.error("Gagal membuat acara");
                }
              } catch {
                toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
              } finally {
                setCreateSaving(false);
              }
            }}
            disabled={createSaving}
            className="w-full py-2.5 rounded-xl bg-emerald text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {createSaving ? "Menyimpan..." : "Buat Acara"}
          </button>
        </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
