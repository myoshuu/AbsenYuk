"use client";

import { useEffect, useState } from "react";
import { cacheGet, cacheSet } from "@/lib/cache";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingPage } from "@/components/shared/Loading";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";

interface AbsensiSession {
  id: number;
  judul: string;
  status: string;
  created_at: string;
  acara_id: number;
  acara_judul: string;
}

interface AbsensiLog {
  id: number;
  username: string;
  keterangan: string;
  waktu_absen: string;
}

export default function OrganizerAbsensiPage() {
  const [sessions, setSessions] = useState<AbsensiSession[]>([]);
  const [logs, setLogs] = useState<AbsensiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogs, setShowLogs] = useState<number | null>(null);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const key = "absensi:log";
      const cached = await cacheGet<AbsensiSession[]>(key);
      if (cached) { if (!cancelled) { setSessions(cached); setLoading(false); } return; }
      try {
        const acaraRes = await fetch("/api/acara?type=list");
        if (!acaraRes.ok) {
          if (!cancelled) { toast.error("Terjadi kesalahan. Silakan coba lagi"); setLoading(false); }
          return;
        }
        const events = await acaraRes.json();
        if (!Array.isArray(events)) {
          if (!cancelled) setSessions([]);
          return;
        }
        const allSessions: AbsensiSession[] = [];
        for (const event of events) {
          try {
            const res = await fetch(`/api/acara/${event.id}/absensi`);
            if (!res.ok) {
              toast.error(`Gagal memuat absensi untuk ${event.judul}`);
              continue;
            }
            const data = await res.json();
            if (Array.isArray(data)) {
              allSessions.push(
                ...data.map((s: any) => ({
                  ...s,
                  acara_judul: event.judul,
                  acara_id: event.id,
                }))
              );
            }
          } catch {
            toast.error(`Terjadi kesalahan koneksi saat memuat absensi ${event.judul}`);
          }
        }
        if (!cancelled) { setSessions(allSessions); cacheSet(key, allSessions, 60); }
      } catch {
        if (!cancelled) toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  async function viewLogs(acaraId: number, absensiId: number) {
    setShowLogs(absensiId);
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/acara/${acaraId}/absensi/${absensiId}/logs`);
      if (!res.ok) {
        toast.error("Terjadi kesalahan. Silakan coba lagi");
        setLogs([]);
        return;
      }
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  }

  if (loading) return <LoadingPage />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-ink">Log Absensi</h1>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          title="Belum ada sesi absensi"
          description="Buat sesi absensi dari halaman acara untuk memulai"
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Card key={s.id} className="p-0">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-ink">{s.judul}</p>
                  <p className="text-xs text-ink-muted">{s.acara_judul}</p>
                  <p className="text-xs text-ink-muted">
                    {new Date(s.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={
                    s.status === "dibuka"
                      ? "bg-success/15 text-success border-success/20"
                      : s.status === "ditutup"
                      ? "bg-destructive/15 text-destructive-foreground"
                      : ""
                  }>
                    {s.status}
                  </Badge>
                  <Button size="sm" variant="ghost" onClick={() => viewLogs(s.acara_id, s.id)}>
                    Log
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!showLogs} onOpenChange={(v) => !v && setShowLogs(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Kehadiran</DialogTitle>
          </DialogHeader>
          {loadingLogs ? (
            <p className="text-sm text-ink-muted">Memuat...</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-ink-muted">Belum ada log kehadiran</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {logs.map((l) => (
                <div key={l.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink">{l.username}</span>
                  <span className="text-ink-muted text-xs">
                    {new Date(l.waktu_absen).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" - "}
                    <Badge className={
                      l.keterangan === "hadir"
                        ? "bg-success/15 text-success border-success/20"
                        : "bg-destructive/15 text-destructive-foreground"
                    }>
                      {l.keterangan}
                    </Badge>
                  </span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
