"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";

interface AcaraData {
  id: number;
  judul: string;
  status: string;
  lokasi: string;
  tanggal_mulai: string;
  organizer_id: string;
}

const statusConfig: Record<string, { label: string; color: string; dot: string; bg: string }> = {
  akan_datang: { label: "Akan Datang", color: "text-emerald", dot: "bg-emerald", bg: "bg-emerald/10 border-emerald/20" },
  berlangsung: { label: "Berlangsung", color: "text-emerald", dot: "bg-emerald", bg: "bg-emerald/10 border-emerald/20" },
  selesai: { label: "Selesai", color: "text-ink-muted", dot: "bg-ink-muted", bg: "bg-bg-warm border-border" },
  dibatalkan: { label: "Dibatalkan", color: "text-error", dot: "bg-error", bg: "bg-error/10 border-error/20" },
};

interface Props {
  acara: AcaraData;
  isJoined: boolean;
  isOwner: boolean;
  role?: string;
  onJoin: () => void;
  onLeave: () => void;
}

export default function AcaraDetailHeader({ acara, isJoined, isOwner, role, onJoin, onLeave }: Props) {
  const router = useRouter();

  return (
    <div className="flex items-start justify-between flex-wrap gap-4">
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-card shadow-md flex items-center justify-center text-ink-muted hover:text-ink hover:shadow-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ink">{acara.judul}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted mt-2">
            <Badge className={`${statusConfig[acara.status]?.bg || ""} ${statusConfig[acara.status]?.color || ""}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig[acara.status]?.dot || ""}`} />
              {statusConfig[acara.status]?.label || acara.status}
            </Badge>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {acara.lokasi || "Lokasi tidak ditentukan"}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(acara.tanggal_mulai).toLocaleDateString("id-ID", { dateStyle: "medium" })}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {role === "user" && !isJoined && (
          <Button onClick={onJoin} className="bg-emerald hover:bg-emerald-hover text-white shadow-md">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Gabung Acara
            </span>
          </Button>
        )}
        {isJoined && role === "user" && (
          <Button variant="outline" onClick={onLeave} className="border-gray-300 text-ink hover:bg-gray-50">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
