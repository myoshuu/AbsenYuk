"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { LoadingPage } from "@/components/shared/Loading";

interface FileData { id: number; nama_asli: string; tipe_file: string; ukuran: number; }

export default function FilesPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<Record<string, "waiting" | "uploading" | "done" | "error">>({});
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [acara, setAcara] = useState<{ organizer_id: string } | null>(null);

  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;

  function load() {
    Promise.all([
      fetch(`/api/acara/${id}/files`).then((r) => r.json()),
      fetch(`/api/acara/${id}`).then((r) => r.json()),
    ]).then(([filesData, acaraData]) => {
      setFiles(filesData);
      setAcara(acaraData);
    }).catch(() => { toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda"); }).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [id]);

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }

  function addToQueue(files: FileList | File[]) {
    const allowed = ["pdf", "xlsx", "xls", "docx", "doc"];
    const valid: File[] = [];
    Array.from(files).forEach((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      if (ext && allowed.includes(ext)) {
        valid.push(f);
      } else {
        toast.error(`${f.name}: Hanya file PDF, Excel, atau Word`);
      }
    });
    setUploadQueue((prev) => [...prev, ...valid]);
  }

  function removeFromQueue(index: number) {
    setUploadQueue((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleUploadFiles() {
    if (uploadQueue.length === 0) return;
    const status: Record<string, "waiting" | "uploading" | "done" | "error"> = {};
    uploadQueue.forEach((f) => { status[f.name] = "waiting"; });
    setUploadStatus(status);
    setUploadProgress({ current: 0, total: uploadQueue.length });

    let success = 0;
    let failed = 0;

    for (let i = 0; i < uploadQueue.length; i++) {
      const file = uploadQueue[i];
      setUploadStatus((prev) => ({ ...prev, [file.name]: "uploading" }));
      setUploadProgress({ current: i + 1, total: uploadQueue.length });
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch(`/api/acara/${id}/files`, { method: "POST", body: fd });
        if (res.ok) {
          setUploadStatus((prev) => ({ ...prev, [file.name]: "done" }));
          success++;
        } else {
          setUploadStatus((prev) => ({ ...prev, [file.name]: "error" }));
          failed++;
        }
      } catch {
        setUploadStatus((prev) => ({ ...prev, [file.name]: "error" }));
        failed++;
      }
    }

    const total = success + failed;
    if (failed === 0) {
      toast.success(`${total} file berhasil diupload`);
    } else {
      toast.warning(`${success} file berhasil, ${failed} file gagal`);
    }

    setShowUpload(false);
    setUploadQueue([]);
    setUploadStatus({});
    load();
  }

  const isOwner = acara?.organizer_id === userId || role === "admin";

  if (loading) return <LoadingPage />;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/dashboard/acara/${id}`)} className="w-10 h-10 rounded-xl bg-card shadow-md flex items-center justify-center text-ink-muted hover:text-ink hover:shadow-lg transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-ink">File Acara</h1>
        </div>
        {isOwner && (
          <Button size="sm" onClick={() => setShowUpload(true)} className="bg-emerald hover:bg-emerald-hover text-white shadow-md">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload
          </Button>
        )}
      </div>

      {files.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald/10 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-ink-muted">Belum ada file yang diupload</p>
              <p className="text-xs text-ink-soft mt-1">Organizer dapat upload file melalui tombol upload</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {files.map((f) => (
            <Card key={f.id}>
              <div className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 rounded-xl bg-emerald/10 shadow-sm flex items-center justify-center">
                  <span className="text-sm font-bold text-emerald uppercase">{f.tipe_file?.slice(0, 3)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{f.nama_asli}</p>
                  <p className="text-xs text-ink-muted">{formatSize(f.ukuran)}</p>
                </div>
                <a href={`/api/acara/${id}/files/${f.id}/download`} target="_blank" className="shrink-0">
                  <Button variant="outline" size="sm" className="border-emerald/30 text-emerald hover:bg-emerald hover:text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showUpload} onOpenChange={(v) => { if (!v) { setShowUpload(false); setUploadQueue([]); setUploadStatus({}); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              Upload File
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-emerald", "bg-emerald/5"); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove("border-emerald", "bg-emerald/5"); }}
              onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-emerald", "bg-emerald/5"); const files = e.dataTransfer.files; if (files.length > 0) addToQueue(files); }}
              onClick={() => document.getElementById("upload-input")?.click()}
              className="border-2 border-dashed border-emerald/30 rounded-xl p-8 text-center cursor-pointer hover:border-emerald hover:bg-emerald/5 transition-all bg-bg-warm/30"
            >
              <input
                id="upload-input"
                type="file"
                multiple
                accept=".pdf,.xlsx,.xls,.docx,.doc"
                onChange={(e) => { if (e.target.files) addToQueue(e.target.files); e.target.value = ""; }}
                className="hidden"
              />
              <svg className="w-12 h-12 text-ink-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm font-medium text-ink">Seret file ke sini</p>
              <p className="text-xs text-ink-muted mt-1">atau klik untuk memilih file</p>
              <p className="text-xs text-ink-soft mt-2">PDF, Excel, atau Word</p>
            </div>

            {uploadQueue.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {uploadQueue.map((f, i) => {
                  const ext = f.name.split(".").pop()?.toLowerCase() || "";
                  const badge = ext === "pdf" ? { label: "PDF", cls: "bg-rose/10 text-rose" }
                    : ext === "xlsx" || ext === "xls" ? { label: "XLS", cls: "bg-emerald/10 text-emerald" }
                    : { label: "DOC", cls: "bg-blue/10 text-blue" };
                  const status = uploadStatus[f.name] || "waiting";
                  return (
                    <div key={f.name + i} className="flex items-center gap-3 py-2 px-3 bg-bg-warm rounded-xl text-sm">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badge.cls}`}>{badge.label}</span>
                      <span className="flex-1 truncate text-ink">{f.name}</span>
                      <span className="text-xs text-ink-muted shrink-0">{(f.size / 1024).toFixed(1)} KB</span>
                      {status === "waiting" && (
                        <button onClick={() => removeFromQueue(i)} className="text-ink-muted hover:text-rose shrink-0">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                      {status === "uploading" && <svg className="w-4 h-4 text-accent animate-spin shrink-0" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                      {status === "done" && <svg className="w-4 h-4 text-emerald shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                      {status === "error" && <svg className="w-4 h-4 text-rose shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => { setShowUpload(false); setUploadQueue([]); setUploadStatus({}); }}>Batal</Button>
              <Button className="flex-1 bg-emerald hover:bg-emerald-hover text-white shadow-md" onClick={handleUploadFiles} disabled={uploadQueue.length === 0 || uploadProgress.current > 0}>
                {uploadProgress.current > 0 ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Mengupload {uploadProgress.current}/{uploadProgress.total}...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload File
                  </span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
