"use client";

import { useEffect, useState } from "react";
import { cacheGet, cacheSet, cacheInvalidate } from "@/lib/cache";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import ActionMenu from "@/components/ui/ActionMenu";
import Pagination from "@/components/ui/Pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SearchInput from "@/components/ui/SearchInput";
import BulkActionBar from "@/components/admin/BulkActionBar";
import { LoadingPage } from "@/components/shared/Loading";
import { toast } from "sonner";

interface UserData { id: string; username: string; email: string; role: string; }

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [editModal, setEditModal] = useState<UserData | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("user");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ username: "", email: "", password: "", role: "user" });
  const [createSaving, setCreateSaving] = useState(false);
  const pageSize = 10;

  async function load() {
    const key = "admin:users:list";
    const cached = await cacheGet<UserData[]>(key);
    if (cached) { setUsers(cached); setLoading(false); return; }
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error?.message || "Terjadi kesalahan. Silakan coba lagi");
        return;
      }
      const data = await res.json();
      setUsers(data);
      cacheSet(key, data, 60);
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(userId: string) {
    if (!confirm("Hapus user ini?")) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) { toast.success("User berhasil dihapus"); await cacheInvalidate("admin:users:list"); load(); }
      else toast.error("Gagal menghapus");
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    }
  }

  async function handleSave() {
    if (!editModal) return;
    if (!editUsername || editUsername.length < 3) {
      toast.error("Username minimal 3 karakter");
      return;
    }
    if (!editEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) {
      toast.error("Format email tidak valid");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = { username: editUsername, email: editEmail, role: editRole };
      if (newPassword) body.password = newPassword;
      const res = await fetch(`/api/admin/users/${editModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { toast.success("User berhasil diperbarui"); setEditModal(null); await cacheInvalidate("admin:users:list"); load(); }
      else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error?.message || "Gagal memperbarui user");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    } finally {
      setSaving(false);
    }
  }

  function openEdit(user: UserData) {
    setEditModal(user);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditRole(user.role);
    setNewPassword("");
    setConfirmPassword("");
  }

  const filteredUsers = searchQuery
    ? users.filter((u) =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    {
      key: "select",
      label: "",
      width: "40px",
      render: (_: unknown, row: UserData) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.id)}
          onChange={() => {
            const next = new Set(selectedIds);
            if (next.has(row.id)) next.delete(row.id);
            else next.add(row.id);
            setSelectedIds(next);
          }}
          className="w-4 h-4 rounded border-border text-accent focus:ring-accent/30"
        />
      ),
    },
    { key: "username", label: "Username", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "role",
      label: "Role",
      render: (value: string) => (
        <Badge className={value === "admin" ? "bg-info/15 text-info" : value === "organizer" ? "bg-warning/15 text-warning" : ""}>{value}</Badge>
      ),
    },
    {
      key: "id",
      label: "Aksi",
      width: "80px",
      render: (_: string, row: UserData) => (
        <div className="flex justify-end">
          <ActionMenu
            actions={[
              { label: "Edit", icon: "edit", onClick: () => openEdit(row) },
              ...(row.role !== "admin" ? [{ label: "Hapus", icon: "trash" as const, variant: "danger" as const, onClick: () => handleDelete(row.id) }] : []),
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
          <h1 className="text-2xl font-bold text-ink">User Manager</h1>
          <p className="text-ink-muted text-sm">Total {users.length} pengguna</p>
        </div>
        <SearchInput
          placeholder="Cari username atau email..."
          onSearch={(v) => { setSearchQuery(v); setPage(1); }}
          className="w-64"
        />
        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald text-white text-sm font-medium hover:opacity-90 transition-all active:scale-[0.96]"
        >
          Tambah User
        </button>
      </div>

      <Card>
        <CardContent className="p-4">
          {paginatedUsers.length === 0 ? (
            <p className="text-sm text-ink-muted text-center py-8">Tidak ada pengguna</p>
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
                {paginatedUsers.map((row, i) => (
                  <TableRow key={row.id || i}>
                    {columns.map((col) => (
                      <TableCell key={col.key}>{col.render ? col.render((row as any)[col.key], row) : (row as any)[col.key]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} pageSize={pageSize} totalItems={filteredUsers.length} />
        </CardContent>
      </Card>

      <Dialog open={!!editModal} onOpenChange={(v) => !v && setEditModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Username</label>
            <input
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-bg-warm border border-border text-ink outline-none focus:border-accent/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Email</label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-bg-warm border border-border text-ink outline-none focus:border-accent/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Role</label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-bg-warm border border-border text-ink outline-none"
            >
              <option value="user">User</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <hr className="border-border" />
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Password Baru (opsional)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Kosongkan jika tidak diubah"
              className="w-full px-3 py-2 rounded-lg bg-bg-warm border border-border text-ink outline-none focus:border-accent/30"
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Konfirmasi Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              className="w-full px-3 py-2 rounded-lg bg-bg-warm border border-border text-ink outline-none focus:border-accent/30"
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

      <Dialog open={createOpen} onOpenChange={(v) => !v && setCreateOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah User</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Username</label>
            <input type="text" value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-bg-warm border border-border text-ink outline-none focus:border-accent/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Email</label>
            <input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-bg-warm border border-border text-ink outline-none focus:border-accent/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Password</label>
            <input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-bg-warm border border-border text-ink outline-none focus:border-accent/30" minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Role</label>
            <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-bg-warm border border-border text-ink outline-none">
              <option value="user">User</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            onClick={async () => {
              if (!createForm.username || !createForm.email || !createForm.password) {
                toast.error("Semua field wajib diisi"); return;
              }
              setCreateSaving(true);
              try {
                const res = await fetch("/api/admin/users", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(createForm),
                });
                if (res.ok) {
                  toast.success("User berhasil ditambahkan");
                  setCreateOpen(false);
                  setCreateForm({ username: "", email: "", password: "", role: "user" });
                  await cacheInvalidate("admin:users:list"); load();
                } else {
                  const err = await res.json();
                  toast.error(err.error?.message || "Gagal menambahkan user");
                }
              } catch {
                toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
              } finally {
                setCreateSaving(false);
              }
            }}
            disabled={createSaving}
            className="w-full py-2.5 rounded-lg bg-emerald text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {createSaving ? "Menyimpan..." : "Tambah User"}
          </button>
        </div>
        </DialogContent>
      </Dialog>

      <BulkActionBar
        selectedCount={selectedIds.size}
        onDeselectAll={() => setSelectedIds(new Set())}
        onBulkDelete={async () => {
          if (!confirm(`Hapus ${selectedIds.size} user?`)) return;
          let successCount = 0;
          for (const id of selectedIds) {
            try {
              const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
              if (res.ok) successCount++;
              else toast.error(`Gagal menghapus user ${id}`);
            } catch {
              toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
            }
          }
          if (successCount > 0) toast.success(`${successCount} user berhasil dihapus`);
          setSelectedIds(new Set());
          await cacheInvalidate("admin:users:list"); load();
        }}
      />
    </motion.div>
  );
}
