"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSent(true);
        toast.success("Link reset password telah dikirim ke email Anda");
      } else {
        const data = await res.json();
        toast.error(data.error?.message || "Gagal mengirim link reset");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Lupa Password</CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Cek email Anda untuk link reset password.</p>
              <Button onClick={() => router.push("/login")}>Kembali ke Login</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Masukkan email Anda" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Mengirim..." : "Kirim Link Reset"}</Button>
              <p className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="underline hover:text-foreground">Kembali ke login</Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
