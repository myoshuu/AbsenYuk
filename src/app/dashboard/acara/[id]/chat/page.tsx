"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { LoadingPage } from "@/components/shared/Loading";
import { toast } from "sonner";

interface MessageData { id: number; user_id: string; message: string; username: string; }

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatStatus, setChatStatus] = useState<"connected" | "polling" | "disconnected">("disconnected");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/acara/${id}/chat`).then((r) => r.json()).then((data: MessageData[]) => {
      if (Array.isArray(data)) {
        setMessages(data);
      }
    }).catch(() => { toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda"); }).finally(() => setLoading(false));

    fetch("/api/auth/session").then((r) => r.json()).then((s) => {
      if (s?.user?.id) setUserId(s.user.id);
    }).catch(() => {});
  }, [id]);

  useEffect(() => {
    const POLL_INTERVAL = 5000;
    let pollingTimer: ReturnType<typeof setInterval> | null = null;
    let lastMessageId = 0;

    const startPolling = () => {
      if (pollingTimer) return;
      pollingTimer = setInterval(async () => {
        try {
          const res = await fetch(`/api/acara/${id}/chat`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              setMessages((prev: MessageData[]) => {
                const existingIds = new Set(prev.map((m) => m.id));
                const unique = data.filter((m) => m.id > lastMessageId && !existingIds.has(m.id));
                if (unique.length > 0) {
                  lastMessageId = Math.max(...unique.map((m) => m.id));
                }
                return [...prev, ...unique];
              });
            }
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, POLL_INTERVAL);
    };

    const stopPolling = () => {
      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
      }
    };

    let es: EventSource | null = null;
    es = new EventSource(`/api/acara/${id}/chat/stream`);
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        setMessages((prev: MessageData[]) => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
      } catch {}
    };
    es.onerror = () => {
      console.log("SSE error, starting polling fallback");
      setChatStatus("polling");
      startPolling();
    };
    es.onopen = () => {
      console.log("SSE connected, stopping polling");
      setChatStatus("connected");
      stopPolling();
    };

    return () => {
      es?.close();
      stopPolling();
    };
  }, [id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function handleSendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const messageToSend = chatInput; // Store before clearing
    setChatInput(""); // Clear input immediately
    try {
      const res = await fetch(`/api/acara/${id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error?.message || "Terjadi kesalahan. Silakan coba lagi");
        setChatInput(messageToSend); // Restore on error
      }
      // Don't add to state here - SSE will broadcast to all clients including sender
    } catch {
      toast.error("Terjadi kesalahan koneksi. Periksa koneksi internet Anda");
      setChatInput(messageToSend); // Restore on error
    }
  }

  if (loading) return <LoadingPage />;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push(`/dashboard/acara/${id}`)} className="w-10 h-10 rounded-xl bg-card shadow-md flex items-center justify-center text-ink-muted hover:text-ink hover:shadow-lg transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-ink">Chat Grup</h1>
      </div>

      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald to-emerald/50" />
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-ink">Chat Grup</h2>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  chatStatus === "connected" ? "bg-emerald animate-pulse" :
                  chatStatus === "polling" ? "bg-amber-500" : "bg-error"
                }`} />
                <span className="text-xs text-ink-muted">
                  {chatStatus === "connected" ? "Terhubung via real-time" :
                   chatStatus === "polling" ? "Memuat..." : "Terputus"}
                </span>
              </div>
            </div>
          </div>

          <div className="h-[50vh] bg-bg-warm/30 rounded-2xl overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-ink-muted">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-3 text-ink-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>Belum ada pesan</p>
                    <p className="text-xs mt-1">Mulai diskusi dengan mengirim pesan!</p>
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.user_id === userId ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                      m.user_id === userId
                        ? "bg-emerald text-white rounded-br-md"
                        : "bg-card text-ink rounded-bl-md"
                    }`}>
                      {m.user_id !== userId && <p className="text-xs text-emerald font-medium mb-1">{m.username}</p>}
                      <p className="text-sm">{m.message}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t border-border bg-card">
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-3 bg-bg-warm rounded-xl border border-border focus:border-emerald/30 focus:ring-2 focus:ring-emerald/20 outline-none text-sm transition-all"
                  placeholder="Ketik pesan..."
                  maxLength={1000}
                />
                <Button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className={`px-5 transition-all duration-200 ${
                    chatInput.trim()
                      ? "bg-emerald hover:bg-emerald-hover text-white shadow-lg shadow-emerald/25 hover:shadow-xl hover:shadow-emerald/30"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
