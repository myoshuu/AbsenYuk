"use client";

import { useEffect, useState } from "react";
import { cacheGet, cacheSet } from "@/lib/cache";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingPage } from "@/components/shared/Loading";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";

const statusBadgeClass: Record<string, string> = {
  akan_datang: "bg-info/15 text-info border-info/20",
  berlangsung: "bg-success/15 text-success border-success/20",
  selesai: "border-border text-ink-muted",
  dibatalkan: "bg-destructive/15 text-destructive-foreground",
};

const statusLabel: Record<string, string> = {
  akan_datang: "Akan Datang",
  berlangsung: "Berlangsung",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

export default function AcaraSayaPage() {
  const [acara, setAcara] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const key = "acara:saya";
      const cached = await cacheGet<any[]>(key);
      if (cached) { if (!cancelled) { setAcara(cached); setLoading(false); } return; }
      try {
        const res = await fetch("/api/acara?type=joined");
        const data = await res.json();
        if (!cancelled) { setAcara(data); cacheSet(key, data, 60); setLoading(false); }
      } catch { if (!cancelled) { setLoading(false); toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda"); } }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-ink mb-6">Acara Saya</h1>
      {acara.length === 0 ? (
        <EmptyState
          title="Belum bergabung acara"
          description="Cari acara dan bergabung untuk melihatnya di sini"
          action={{ label: "Cari Acara", onClick: () => router.push("/dashboard/acara") }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {acara.map((a) => (
            <Card key={a.id} className="cursor-pointer hover:shadow-lg transition-shadow p-4" onClick={() => router.push(`/dashboard/acara/${a.id}`)}>
              <CardContent className="p-0">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-ink">{a.judul}</h3>
                <Badge className={statusBadgeClass[a.status] || ""}>{statusLabel[a.status] || a.status}</Badge>
              </div>
              <p className="text-sm text-ink-muted mb-1">{a.lokasi || "-"}</p>
              <p className="text-xs text-ink-soft">{new Date(a.tanggal_mulai).toLocaleDateString("id-ID", { dateStyle: "long" })}</p>
            </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
