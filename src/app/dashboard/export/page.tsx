"use client";

import { useState, useEffect, useCallback } from "react";
import { cacheGet, cacheSet } from "@/lib/cache";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/ui/Pagination";
import { toast } from "sonner";

interface ExportLog { id: number; tipe_data: string; format: string; parameter: unknown; jumlah_record: number; status: string; created_at: string; }

const SVG_ICONS: Record<string, string> = {
  acara: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  absensi: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
};

const TIPE_LABEL: Record<string, string> = {
  acara: "Acara",
  absensi: "Absensi",
  users: "Users",
};

const STATUS_BADGE: Record<string, string> = {
  success: "bg-success/15 text-success border-success/20",
  error: "bg-destructive/15 text-destructive-foreground",
};

export default function ExportPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const role = session?.user?.role;

  const [loading, setLoading] = useState(false);
  const [acaraId, setAcaraId] = useState("");
  const [history, setHistory] = useState<ExportLog[]>([]);
  const [totalHistory, setTotalHistory] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);
  const [tipeFilter, setTipeFilter] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [exportingType, setExportingType] = useState("");
  const [flashingCard, setFlashingCard] = useState<string | null>(null);

  if (session && role !== "admin") {
    router.replace("/dashboard");
    return null;
  }

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    const key = `export:history:${historyPage}:${tipeFilter || "all"}`;
    const cached = await cacheGet<any>(key);
    if (cached) { setHistory(cached.logs || []); setTotalHistory(cached.total || 0); setHistoryTotalPages(cached.totalPages || 0); setHistoryLoading(false); return; }
    try {
      const params = new URLSearchParams({ page: String(historyPage), limit: "10" });
      if (tipeFilter) params.set("tipe", tipeFilter);
      const res = await fetch(`/api/export/logs?${params}`);
      if (!res.ok) {
        toast.error("Terjadi kesalahan. Silakan coba lagi");
        return;
      }
      const data = await res.json();
      setHistory(data.logs || []);
      setTotalHistory(data.total || 0);
      setHistoryTotalPages(data.totalPages || 0);
      cacheSet(key, data, 60);
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage, tipeFilter]);

  useEffect(() => { if (role === "admin") loadHistory(); }, [loadHistory, role]);

  async function doExport(type: string, format: string) {
    let url = `/api/export?type=${type}&format=${format}`;
    if (type === "absensi") {
      if (!acaraId) { toast.error("Masukkan ID acara untuk export absensi"); return; }
      url += `&acara_id=${acaraId}`;
    }
    setExportingType(`${type}-${format}`);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Gagal export");
      const blob = await res.blob();
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = `${type}-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(dlUrl);
      toast.success("Export berhasil");
      setFlashingCard(type);
      setTimeout(() => setFlashingCard(null), 2000);
      loadHistory();
    } catch {
      toast.error("Gagal export data");
      loadHistory();
    } finally {
      setExportingType("");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-10"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <h1 className="text-2xl font-bold text-ink">Download Center</h1>
        <p className="text-ink-muted mt-1">Export data platform ke file Excel atau PDF</p>
      </motion.div>

      {/* Zone 1: Export Tools */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
        }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Export Acara */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
          }}
        >
          <Card className="flex flex-col" style={flashingCard === "acara" ? { borderColor: "#1a7a4a", borderWidth: "2px" } : undefined}>
            <CardContent>
              <motion.div whileHover={{ scale: 1.1 }} className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={SVG_ICONS.acara} />
                </svg>
              </motion.div>
              <h3 className="font-semibold text-ink text-lg mb-1">Export Acara</h3>
              <p className="text-sm text-ink-muted mb-5 flex-1">Download daftar semua acara ke file Excel atau PDF</p>
              <div className="flex gap-3">
                <Button size="sm" variant="outline" onClick={() => doExport("acara", "pdf")} disabled={exportingType === "acara-pdf"} className="flex-1 border-emerald/30 text-emerald hover:bg-emerald hover:text-white transition-all">
                  {exportingType === "acara-pdf" ? (
                    <><svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Export PDF</>
                  ) : "PDF"}
                </Button>
                <Button size="sm" onClick={() => doExport("acara", "xlsx")} disabled={exportingType === "acara-xlsx"} className="flex-1 bg-emerald hover:bg-emerald-hover text-white shadow-md transition-all">
                  {exportingType === "acara-xlsx" ? (
                    <><svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Export XLSX</>
                  ) : "XLSX"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Export Absensi */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
          }}
        >
          <Card className="flex flex-col" style={flashingCard === "absensi" ? { borderColor: "#1a7a4a", borderWidth: "2px" } : undefined}>
            <CardContent>
              <motion.div whileHover={{ scale: 1.1 }} className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={SVG_ICONS.absensi} />
                </svg>
              </motion.div>
              <h3 className="font-semibold text-ink text-lg mb-1">Export Absensi</h3>
              <p className="text-sm text-ink-muted mb-4">Download log kehadiran berdasarkan ID acara</p>
              <input
                value={acaraId}
                onChange={(e) => setAcaraId(e.target.value)}
                placeholder="Masukkan ID Acara"
                className="w-full px-3 py-2.5 bg-bg-warm rounded-xl text-sm border border-border focus:border-accent/30 outline-none mb-3"
              />
              <div className="flex gap-3 mt-auto">
                <Button size="sm" variant="outline" onClick={() => doExport("absensi", "pdf")} disabled={!acaraId || exportingType === "absensi-pdf"} className="flex-1 border-emerald/30 text-emerald hover:bg-emerald hover:text-white transition-all">
                  {exportingType === "absensi-pdf" ? (
                    <><svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Export PDF</>
                  ) : "PDF"}
                </Button>
                <Button size="sm" onClick={() => doExport("absensi", "xlsx")} disabled={!acaraId || exportingType === "absensi-xlsx"} className="flex-1 bg-emerald hover:bg-emerald-hover text-white shadow-md transition-all">
                  {exportingType === "absensi-xlsx" ? (
                    <><svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Export XLSX</>
                  ) : "XLSX"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Export Users */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
          }}
        >
          <Card className="flex flex-col" style={flashingCard === "users" ? { borderColor: "#1a7a4a", borderWidth: "2px" } : undefined}>
            <CardContent>
              <motion.div whileHover={{ scale: 1.1 }} className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={SVG_ICONS.users} />
                </svg>
              </motion.div>
              <h3 className="font-semibold text-ink text-lg mb-1">Export User</h3>
              <p className="text-sm text-ink-muted mb-5 flex-1">Download daftar seluruh pengguna platform</p>
              <div className="flex gap-3">
                <Button size="sm" variant="outline" onClick={() => doExport("users", "pdf")} disabled={exportingType === "users-pdf"} className="flex-1 border-emerald/30 text-emerald hover:bg-emerald hover:text-white transition-all">
                  {exportingType === "users-pdf" ? (
                    <><svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Export PDF</>
                  ) : "PDF"}
                </Button>
                <Button size="sm" onClick={() => doExport("users", "xlsx")} disabled={exportingType === "users-xlsx"} className="flex-1 bg-emerald hover:bg-emerald-hover text-white shadow-md transition-all">
                  {exportingType === "users-xlsx" ? (
                    <><svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Export XLSX</>
                  ) : "XLSX"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Zone 2: Export History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-ink">Riwayat Export</h2>
            <span className="text-xs bg-bg-warm text-ink-muted px-2.5 py-1 rounded-full">{totalHistory} total</span>
          </div>
          <select
            value={tipeFilter}
            onChange={(e) => { setTipeFilter(e.target.value); setHistoryPage(1); }}
            className="px-3 py-2 text-sm bg-bg-warm rounded-xl border border-border outline-none text-ink"
          >
            <option value="">Semua Tipe</option>
            <option value="acara">Acara</option>
            <option value="absensi">Absensi</option>
            <option value="users">Users</option>
          </select>
        </div>

        <Card>
          <CardContent className="p-4">
          {historyLoading ? (
            <div className="py-12 text-center text-sm text-ink-muted">Memuat...</div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 bg-bg-warm rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <p className="text-sm text-ink-muted font-medium">Belum ada riwayat export</p>
              <p className="text-xs text-ink-soft mt-1">Data export akan muncul di sini setelah Anda melakukan export</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-ink-muted border-b border-border">
                    <th className="text-left py-3 px-3 font-medium">Tipe Data</th>
                    <th className="text-left py-3 px-3 font-medium">Format</th>
                    <th className="text-left py-3 px-3 font-medium">Parameter</th>
                    <th className="text-right py-3 px-3 font-medium">Jumlah Record</th>
                    <th className="text-left py-3 px-3 font-medium">Status</th>
                    <th className="text-left py-3 px-3 font-medium">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((log) => (
                    <tr key={log.id} className="border-b border-border hover:bg-bg-warm/50 transition-colors">
                      <td className="py-3 px-3 text-ink font-medium">{TIPE_LABEL[log.tipe_data] || log.tipe_data}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${
                          log.format === "xlsx" ? "bg-emerald/10 text-emerald" : "bg-error/10 text-error"
                        }`}>
                          {log.format === "xlsx" ? "XLSX" : "PDF"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-ink-muted text-xs">{log.parameter ? JSON.stringify(log.parameter) : "-"}</td>
                      <td className="py-3 px-3 text-ink text-right">{log.jumlah_record}</td>
                      <td className="py-3 px-3">
                        <Badge className={STATUS_BADGE[log.status] || ""}>
                          {log.status === "success" ? "Berhasil" : "Gagal"}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-ink-muted text-xs">
                        {new Date(log.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {historyTotalPages > 1 && (
            <Pagination currentPage={historyPage} totalPages={historyTotalPages} onPageChange={setHistoryPage} pageSize={10} totalItems={totalHistory} />
          )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
