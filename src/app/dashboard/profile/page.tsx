"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { cacheGet, cacheSet } from "@/lib/cache";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { LoadingPage } from "@/components/shared/Loading";
import { profileSchema, passwordSchema } from "@/lib/validations";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [profileStats, setProfileStats] = useState<any>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const key = "profile:me";
      const cached = await cacheGet<any>(key);
      if (cached) { if (!cancelled) setUsername(cached.username || ""); return; }
      try {
        const res = await fetch("/api/user/me");
        if (!res.ok) {
          if (!cancelled) toast.error("Terjadi kesalahan. Silakan coba lagi");
          return;
        }
        const d = await res.json();
        if (!cancelled) { setUsername(d.username || ""); cacheSet(key, d, 30); }
      } catch { if (!cancelled) toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda"); }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const key = "profile:stats";
      const cached = await cacheGet<any>(key);
      if (cached) { if (!cancelled) setProfileStats(cached); return; }
      try {
        const res = await fetch("/api/dashboard/stats");
        if (!res.ok) {
          if (!cancelled) toast.error("Terjadi kesalahan. Silakan coba lagi");
          return;
        }
        const data = await res.json();
        if (!cancelled) { setProfileStats(data); cacheSet(key, data, 30); }
      } catch { if (!cancelled) toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda"); }
    })();
    return () => { cancelled = true; };
  }, []);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    const parsed = profileSchema.safeParse({ username });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => { fieldErrors[e.path[0] as string] = e.message; });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/user/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (res.ok) {
        toast.success("Profil berhasil diperbarui");
        await update({ name: username });
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error?.message || "Gagal memperbarui profil");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    }
    setLoading(false);
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    const parsed = passwordSchema.safeParse(pwForm);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => { fieldErrors[e.path[0] as string] = e.message; });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setPwLoading(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password berhasil diubah");
        setPwForm({ currentPassword: "", newPassword: "" });
      } else {
        toast.error(data.error?.message || "Gagal mengubah password");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    }
    setPwLoading(false);
  }

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format file tidak didukung. Gunakan JPEG, PNG, GIF, atau WebP");
      return;
    }

    const fd = new FormData();
    fd.append("avatar", file);
    try {
      const res = await fetch("/api/user/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        toast.success("Avatar berhasil diubah");
        // Force session update - this will trigger the jwt callback to re-fetch from database
        await update({ image: data.avatar });
        // Also invalidate the profile cache to ensure fresh data
        const { cacheInvalidate } = await import("@/lib/cache");
        await cacheInvalidate("profile:me");
      } else {
        toast.error(data.error?.message || "Gagal mengupload avatar");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setDeleteLoading(false);
    setShowDelete(false);
    toast.info("Fitur dalam pengembangan");
  }

  if (!session) return <LoadingPage />;

  const role = (session?.user as any)?.role;

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink">Pengaturan Profil</h1>
        <p className="text-ink-muted text-sm mt-1">Kelola informasi akun dan preferensi Anda</p>
      </div>

      {/* Avatar & Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald to-emerald/60 flex items-center justify-center text-3xl font-bold text-white shadow-lg overflow-hidden ring-4 ring-white">
                {session.user?.image ? (
                  <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  session.user?.name?.[0]?.toUpperCase() || "U"
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatar}
                className="hidden"
              />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-ink">{session.user?.name}</h2>
              <p className="text-ink-muted text-sm mt-0.5">{session.user?.email}</p>
              <div className="mt-3">
                <Badge className={
                  role === "admin" ? "bg-info/15 text-info border-info/20" :
                  role === "organizer" ? "bg-warning/15 text-warning border-warning/20" :
                  "bg-emerald/10 text-emerald border-emerald/20"
                }>
                  {role === "admin" ? "Administrator" : role === "organizer" ? "Organizer" : "Peserta"}
                </Badge>
              </div>
            </div>

            {/* Stats */}
            {profileStats && (
              <div className="flex gap-6 sm:gap-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-ink">{profileStats.total_acara || 0}</p>
                  <p className="text-xs text-ink-muted">Acara</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-ink">{profileStats.total_absensi || 0}</p>
                  <p className="text-xs text-ink-muted">Absensi</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Username Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Informasi Dasar
            </h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">@</span>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                    className="pl-8 bg-bg-warm border-border focus:border-emerald"
                    placeholder="Masukkan username"
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.username}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-emerald hover:bg-emerald-hover text-white transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Menyimpan...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Simpan Perubahan
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Change Password Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Ubah Password
            </h3>
            <form onSubmit={handlePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Password Saat Ini</label>
                <Input
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  required
                  className="bg-bg-warm border-border focus:border-emerald"
                  placeholder="Masukkan password saat ini"
                />
                {errors.currentPassword && (
                  <p className="text-xs text-error mt-1.5 flex items-center gap-1">{errors.currentPassword}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Password Baru</label>
                <Input
                  type="password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  required
                  minLength={8}
                  className="bg-bg-warm border-border focus:border-emerald"
                  placeholder="Minimal 8 karakter"
                />
                {errors.newPassword && (
                  <p className="text-xs text-error mt-1.5 flex items-center gap-1">{errors.newPassword}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={pwLoading}
                variant="outline"
                className="w-full sm:w-auto border-emerald/30 text-emerald hover:bg-emerald hover:text-white transition-all duration-200"
              >
                {pwLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Mengubah...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Ubah Password
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-error/20 bg-error/5">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-error flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Zona Berbahaya
                </h3>
                <p className="text-sm text-ink-muted mt-1">
                  Menghapus akun akan menghilangkan semua data Anda secara permanen.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDelete(true)}
                className="shrink-0 bg-error hover:bg-error/90 text-white shadow-md transition-all duration-200"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Hapus Akun
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDelete} onOpenChange={(v) => !v && setShowDelete(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-error">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Hapus Akun?
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-ink-muted mb-4">
              Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.
            </p>
            <ul className="text-sm text-ink-muted space-y-1 bg-error/5 p-3 rounded-lg">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                Semua acara yang Anda buat akan dihapus
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                Semua data absensi akan hilang
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                Chat dan file akan dihapus permanen
              </li>
            </ul>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDelete(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="flex-1 bg-error hover:bg-error/90"
            >
              {deleteLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Menghapus...
                </span>
              ) : (
                "Hapus Permanen"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
