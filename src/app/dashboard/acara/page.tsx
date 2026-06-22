"use client";

import { useEffect, useMemo, useState } from "react";
import { cacheGet, cacheSet } from "@/lib/cache";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { LoadingPage } from "@/components/shared/Loading";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";

const statusBadgeClass: Record<string, string> = {
  akan_datang: "bg-info/15 text-info border-info/20",
  berlangsung: "bg-emerald/15 text-emerald border-emerald/20",
  selesai: "bg-gray-100 text-gray-600 border-gray-200",
  dibatalkan: "bg-destructive/15 text-destructive-foreground border-destructive/20",
};

const statusLabel: Record<string, string> = {
  akan_datang: "Akan Datang",
  berlangsung: "Berlangsung",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

interface BrowseAcaraItem {
  id: number;
  judul: string;
  lokasi: string;
  status: string;
  tanggal_mulai: string;
  created_at: string;
}

const statusFilters = [
  { value: "", label: "Semua" },
  { value: "berlangsung", label: "Berlangsung" },
  { value: "akan_datang", label: "Akan Datang" },
  { value: "selesai", label: "Selesai" },
];

export default function BrowseAcaraPage() {
  const [acara, setAcara] = useState<BrowseAcaraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("terbaru");
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const key = `acara:browse:${debouncedSearch || ""}`;
      const cached = await cacheGet<BrowseAcaraItem[]>(key);
      if (cached) { if (!cancelled) { setAcara(cached); setLoading(false); } return; }
      try {
        let url = "/api/acara?type=browse";
        if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!cancelled) { setAcara(data); cacheSet(key, data, 60); setLoading(false); }
      } catch { if (!cancelled) { setLoading(false); toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda"); } }
    })();
    return () => { cancelled = true; };
  }, [debouncedSearch]);

  const filteredAcara = useMemo(() => {
    let result = [...acara] as any[];
    if (filter) result = result.filter((a) => a.status === filter);
    if (sort === "akan_datang") return [...result].sort((a, b) => new Date(a.tanggal_mulai).getTime() - new Date(b.tanggal_mulai).getTime());
    return [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [acara, filter, sort]);

  if (loading) return <LoadingPage />;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink">Cari Acara</h1>
        <p className="text-ink-muted text-sm mt-1">Temukan acara yang menarik untuk diikuti</p>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {statusFilters.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
            className={`rounded-full ${
              filter === f.value
                ? "bg-emerald hover:bg-emerald-hover text-white shadow-md"
                : "border-emerald/30 text-emerald hover:bg-emerald hover:text-white"
            }`}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Search & Sort */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari acara atau lokasi..."
            className="pl-10 pr-4 bg-bg-warm border-border focus:border-emerald"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 bg-bg-warm rounded-lg text-sm border border-border text-ink outline-none focus:border-emerald cursor-pointer"
        >
          <option value="terbaru">Terbaru</option>
          <option value="akan_datang">Akan Datang</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-ink-muted">
        {filteredAcara.length > 0 && (
          <span>Ditemukan <span className="font-medium text-ink">{filteredAcara.length}</span> acara</span>
        )}
      </div>

      {/* Empty State */}
      {filteredAcara.length === 0 ? (
        <EmptyState
          title="Tidak ada acara ditemukan"
          description={
            filter || search
              ? "Coba ubah filter atau kata kunci pencarian Anda."
              : "Belum ada acara yang tersedia saat ini."
          }
          action={
            filter || search
              ? { label: "Reset Filter", onClick: () => { setFilter(""); setSearch(""); } }
              : undefined
          }
        />
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredAcara.map((a) => (
            <motion.div
              key={a.id}
              variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className="cursor-pointer hover:shadow-xl transition-all duration-200 overflow-hidden group"
                onClick={() => router.push(`/dashboard/acara/${a.id}`)}
              >
                {/* Card Header - Colored bar based on status */}
                <div className={`h-1.5 ${
                  a.status === "berlangsung" ? "bg-gradient-to-r from-emerald to-emerald/50" :
                  a.status === "akan_datang" ? "bg-gradient-to-r from-info to-info/50" :
                  a.status === "selesai" ? "bg-gradient-to-r from-gray-400 to-gray-300" :
                  "bg-gradient-to-r from-error to-error/50"
                }`} />

                <CardContent className="p-5">
                  {/* Status Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={`${statusBadgeClass[a.status] || ""} text-xs font-medium`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        a.status === "berlangsung" ? "bg-emerald" :
                        a.status === "akan_datang" ? "bg-info" :
                        a.status === "selesai" ? "bg-gray-500" : "bg-error"
                      }`} />
                      {statusLabel[a.status] || a.status}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-ink text-base mb-2 line-clamp-2 group-hover:text-emerald transition-colors">
                    {a.judul}
                  </h3>

                  {/* Meta Info */}
                  <div className="space-y-2 text-sm text-ink-muted">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-bg-warm flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="truncate text-sm">{a.lokasi || "Lokasi belum ditentukan"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-bg-warm flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-sm">
                        {new Date(a.tanggal_mulai).toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* View Button */}
                  <div className="mt-4 pt-3 border-t border-border">
                    <span className="text-sm font-medium text-emerald flex items-center gap-1 group-hover:gap-2 transition-all">
                      Lihat Detail
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
