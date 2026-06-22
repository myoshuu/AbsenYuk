"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { toast.error("Password tidak cocok"); return; }
    if (password.length < 6) { toast.error("Password minimal 6 karakter"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        toast.success("Password berhasil direset");
        router.push("/login");
      } else {
        const data = await res.json();
        toast.error(data.error?.message || "Gagal mereset password");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Reset Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password Baru</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Konfirmasi Password</Label>
            <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Ulangi password" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Menyimpan..." : "Reset Password"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-muted-foreground">Memuat...</div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
